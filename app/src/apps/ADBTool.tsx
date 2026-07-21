import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Usb, Wifi, Cable, Zap, Loader2, AlertCircle,
  Smartphone, Info, Copy, BookOpen,
  Terminal, Package, Battery, Settings
} from 'lucide-react';

import { AdbDaemonWebUsbDeviceManager } from '@yume-chan/adb-daemon-webusb';
import { AdbDaemonTransport } from '@yume-chan/adb';
import type { Adb, AdbCredentialStore, AdbPrivateKey } from '@yume-chan/adb';

// --- Credential Store ---
class BrowserCredentialStore implements AdbCredentialStore {
  private readonly keyName = 'adb_private_key';

  async generateKey(): Promise<AdbPrivateKey> {
    const keyPair = await crypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['sign', 'verify']
    );
    const exported = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const buffer = new Uint8Array(exported);
    localStorage.setItem(this.keyName, JSON.stringify(Array.from(buffer)));
    return { buffer, name: 'browser_key' };
  }

  iterateKeys(): AsyncIterable<AdbPrivateKey> {
    const stored = localStorage.getItem(this.keyName);
    const keys: AdbPrivateKey[] = [];
    if (stored) {
      try {
        const buffer = new Uint8Array(JSON.parse(stored));
        keys.push({ buffer, name: 'browser_key' });
      } catch { /* ignore */ }
    }
    return {
      async *[Symbol.asyncIterator]() {
        for (const key of keys) yield key;
      }
    };
  }
}

// --- Types ---
interface LogEntry {
  text: string;
  color?: string;
  time?: string;
}

interface DeviceInfo {
  model: string;
  androidVersion: string;
  sdkVersion: string;
  manufacturer: string;
  serial: string;
  batteryLevel: string;
  batteryStatus: string;
  ipAddress: string;
}

// --- Helper: run shell and return text output ---
async function runShell(adb: Adb, cmd: string[]): Promise<string> {
  const shell = adb.subprocess.shellProtocol;
  if (shell?.isSupported) {
    const r = await shell.spawnWaitText(cmd);
    return r.stdout || r.stderr || '';
  }
  // fallback to none protocol (returns string directly)
  return adb.subprocess.noneProtocol.spawnWaitText(cmd);
}

export default function ADBTool() {
  const [activeTab, setActiveTab] = useState<'adb' | 'ip' | 'help'>('adb');
  const [webUSBSupported, setWebUSBSupported] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('5555');
  const [executing, setExecuting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceSerial, setDeviceSerial] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const adbRef = useRef<Adb | null>(null);

  // Init
  useEffect(() => {
    setWebUSBSupported('usb' in navigator && !!navigator.usb);
    addLog('ADB 工具已启动', '#00B4D8');
    addLog(`WebUSB API: ${'usb' in navigator ? '可用' : '不可用'}`, 'usb' in navigator ? '#10B981' : '#EF4444');
  }, []);

  const addLog = useCallback((text: string, color?: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLogs(prev => [...prev, { text, color, time }]);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Connect Device ---
  const connectDevice = useCallback(async () => {
    const manager = AdbDaemonWebUsbDeviceManager.BROWSER;
    if (!manager) {
      addLog('错误：浏览器不支持 WebUSB API', '#EF4444');
      addLog('请使用 Chrome、Edge 或 Opera 浏览器', '#EF4444');
      return;
    }
    setConnecting(true);
    addLog('正在请求 USB 设备权限...', '#F59E0B');

    try {
      const usbDevice = await manager.requestDevice({
        filters: [{ classCode: 0xFF, subclassCode: 0x42, protocolCode: 0x01 }]
      });
      if (!usbDevice) {
        addLog('未选择设备', '#EF4444');
        setConnecting(false);
        return;
      }

      addLog(`设备已选择: ${usbDevice.name}`, '#10B981');
      addLog(`序列号: ${usbDevice.serial}`, '#10B981');
      setDeviceName(usbDevice.name);
      setDeviceSerial(usbDevice.serial);

      addLog('正在建立 ADB 连接...', '#F59E0B');
      const connection = await usbDevice.connect();
      addLog('USB 连接已建立', '#10B981');

      const credentialStore = new BrowserCredentialStore();
      addLog('正在进行 ADB 认证...', '#F59E0B');

      const transport = await AdbDaemonTransport.authenticate({
        serial: usbDevice.serial,
        connection,
        credentialStore,
      });
      addLog('ADB 认证成功', '#10B981');

      const { Adb } = await import('@yume-chan/adb');
      const adb = new Adb(transport);
      adbRef.current = adb;

      addLog(`设备型号: ${adb.banner.model || 'Unknown'}`, '#00B4D8');
      addLog(`产品名称: ${adb.banner.product || 'Unknown'}`, '#00B4D8');

      setConnected(true);
      addLog('ADB 连接成功！', '#00B4D8');

      // Auto fetch basic info
      await fetchDeviceInfo(adb);

      // Handle disconnect
      transport.disconnected.then(() => {
        addLog('设备已断开连接', '#EF4444');
        setConnected(false);
        adbRef.current = null;
        setDeviceInfo(null);
      });
    } catch (e: any) {
      if (e.name === 'NotFoundError') {
        addLog('未选择设备', '#EF4444');
      } else if (e.message?.includes('user cancelled') || e.message?.includes('cancelled')) {
        addLog('用户取消了操作', '#EF4444');
      } else {
        addLog(`连接失败: ${e.message || String(e)}`, '#EF4444');
      }
      setConnected(false);
      adbRef.current = null;
    } finally {
      setConnecting(false);
    }
  }, [addLog]);

  // --- Fetch device info ---
  const fetchDeviceInfo = async (adb: Adb) => {
    try {
      const info: Partial<DeviceInfo> = {};
      info.serial = adb.serial;
      try { info.model = await adb.getProp('ro.product.model'); } catch { info.model = adb.banner.model || 'Unknown'; }
      try { info.androidVersion = await adb.getProp('ro.build.version.release'); } catch { info.androidVersion = 'Unknown'; }
      try { info.sdkVersion = await adb.getProp('ro.build.version.sdk'); } catch { info.sdkVersion = 'Unknown'; }
      try { info.manufacturer = await adb.getProp('ro.product.manufacturer'); } catch { info.manufacturer = 'Unknown'; }
      setDeviceInfo(prev => ({ ...prev, ...info } as DeviceInfo));
    } catch (e: any) {
      addLog(`获取设备信息失败: ${e.message}`, '#EF4444');
    }
  };

  // --- Execute shell command ---
  const executeShell = useCallback(async (command: string, label: string) => {
    const adb = adbRef.current;
    if (!adb) { addLog('错误：请先连接设备', '#EF4444'); return ''; }
    setExecuting(true);
    addLog(`> adb shell ${command}`, '#979DAC');
    const startTime = performance.now();

    try {
      const output = await runShell(adb, command.split(' '));
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

      if (output) {
        output.split('\n').filter(l => l.trim()).forEach(line => addLog(`  ${line}`, '#A0A0A0'));
      }
      addLog(`[${label}] 完成 (${elapsed}s)`, '#10B981');
      return output;
    } catch (e: any) {
      addLog(`  错误: ${e.message || String(e)}`, '#EF4444');
      return '';
    } finally {
      setExecuting(false);
    }
  }, [addLog]);

  // --- Quick command handlers ---
  const handleDeviceList = useCallback(async () => {
    if (!adbRef.current) return;
    setExecuting(true);
    addLog(`> adb devices`, '#979DAC');
    addLog(`  ${adbRef.current.serial}\tdevice`, '#A0A0A0');
    addLog('[设备列表] 完成', '#10B981');
    setExecuting(false);
  }, [addLog]);

  const handleDeviceModel = useCallback(async () => {
    const output = await executeShell('getprop ro.product.model', '设备型号');
    if (output) setDeviceInfo(prev => prev ? { ...prev, model: output.trim() } : prev);
  }, [executeShell]);

  const handleSystemVersion = useCallback(async () => {
    const output = await executeShell('getprop ro.build.version.release', '系统版本');
    if (output) setDeviceInfo(prev => prev ? { ...prev, androidVersion: output.trim() } : prev);
  }, [executeShell]);

  const handleBatteryInfo = useCallback(async () => {
    const output = await executeShell('dumpsys battery', '电池信息');
    if (output) {
      const levelMatch = output.match(/level:\s*(\d+)/);
      const statusMatch = output.match(/status:\s*(\d+)/);
      const statusMap: Record<string, string> = { '1': '未知', '2': '充电中', '3': '放电中', '4': '未充电', '5': '已充满' };
      setDeviceInfo(prev => prev ? {
        ...prev,
        batteryLevel: levelMatch ? `${levelMatch[1]}%` : 'Unknown',
        batteryStatus: statusMatch ? (statusMap[statusMatch[1]] || statusMatch[1]) : 'Unknown'
      } : prev);
    }
  }, [executeShell]);

  const handleInstalledApps = useCallback(async () => {
    const output = await executeShell('pm list packages', '已安装应用');
    if (output) {
      const apps = output.split('\n').filter(l => l.trim().startsWith('package:'));
      addLog(`  共 ${apps.length} 个应用`, '#00B4D8');
    }
  }, [executeShell, addLog]);

  const handleOpenSettings = useCallback(async () => {
    await executeShell('am start -a android.settings.SETTINGS', '打开设置');
  }, [executeShell]);

  // --- Get Device IP ---
  const getDeviceIP = useCallback(async () => {
    const adb = adbRef.current;
    if (!adb) { addLog('错误：请先连接设备', '#EF4444'); return; }
    setExecuting(true);
    addLog('> adb shell ip addr show wlan0', '#979DAC');

    try {
      const output = await runShell(adb, ['ip', 'addr', 'show', 'wlan0']);
      const ipMatch = output.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
      if (ipMatch) {
        const ip = ipMatch[1];
        setIpAddress(ip);
        setDeviceInfo(prev => prev ? { ...prev, ipAddress: ip } : prev);
        addLog(`  inet ${ip}/24`, '#A0A0A0');
        addLog(`设备 IP: ${ip}`, '#00B4D8');
      } else {
        // Try ifconfig
        const output2 = await runShell(adb, ['ifconfig', 'wlan0']);
        const ipMatch2 = output2.match(/inet\s+(?:addr:)?(\d+\.\d+\.\d+\.\d+)/);
        if (ipMatch2) {
          setIpAddress(ipMatch2[1]);
          setDeviceInfo(prev => prev ? { ...prev, ipAddress: ipMatch2[1] } : prev);
          addLog(`设备 IP: ${ipMatch2[1]}`, '#00B4D8');
        } else {
          addLog('  未找到 IP 地址（请确保 WiFi 已连接）', '#EF4444');
        }
      }
    } catch (e: any) {
      addLog(`  错误: ${e.message || String(e)}`, '#EF4444');
    } finally {
      setExecuting(false);
    }
  }, [addLog]);

  // --- Enable WiFi ADB ---
  const enableWiFiADB = useCallback(async () => {
    if (!ipAddress) { addLog('错误：请输入设备 IP 地址', '#EF4444'); return; }
    const adb = adbRef.current;
    if (!adb) { addLog('错误：请先通过 USB 连接设备', '#EF4444'); return; }

    setExecuting(true);
    addLog(`正在启用 WiFi 调试并连接到 ${ipAddress}:${port}...`, '#F59E0B');

    try {
      addLog('> adb tcpip ' + port, '#979DAC');
      await adb.tcpip.setPort(Number(port));
      addLog(`已在设备上启用端口 ${port}`, '#10B981');
      addLog('请拔掉 USB 线，然后点击「通过 WiFi 连接」', '#F59E0B');
    } catch (e: any) {
      addLog(`启用 WiFi 调试失败: ${e.message || String(e)}`, '#EF4444');
    } finally {
      setExecuting(false);
    }
  }, [ipAddress, port, addLog]);

  // --- Disconnect ---
  const disconnectDevice = useCallback(async () => {
    if (adbRef.current) {
      try { await adbRef.current.close(); } catch { /* ignore */ }
      adbRef.current = null;
    }
    setConnected(false);
    setDeviceInfo(null);
    setDeviceName('');
    setDeviceSerial('');
    addLog('设备已断开', '#EF4444');
  }, [addLog]);

  // Quick commands config
  const quickCommands = [
    { label: '设备列表', handler: handleDeviceList, icon: Smartphone },
    { label: '设备型号', handler: handleDeviceModel, icon: Smartphone },
    { label: '系统版本', handler: handleSystemVersion, icon: Info },
    { label: '电池信息', handler: handleBatteryInfo, icon: Zap },
    { label: '已安装应用', handler: handleInstalledApps, icon: Package },
    { label: '打开设置', handler: handleOpenSettings, icon: Settings },
  ];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {[
          { key: 'adb' as const, label: 'ADB 调试', icon: Cable },
          { key: 'ip' as const, label: 'IP 网络调试', icon: Wifi },
          { key: 'help' as const, label: '使用帮助', icon: BookOpen },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors ${activeTab === t.key ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-muted-foreground hover:text-white'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ADB Tab */}
      {activeTab === 'adb' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Connection bar */}
          <div className="p-3 border-b border-white/5">
            {!connected ? (
              <div>
                {!webUSBSupported && (
                  <div className="mb-2 px-2 py-1.5 rounded bg-red-500/10 text-red-400 text-[10px]">
                    <AlertCircle size={10} className="inline mr-1" />
                    当前浏览器不支持 WebUSB，请使用 Chrome/Edge/Opera
                  </div>
                )}
                <button onClick={connectDevice} disabled={connecting || !webUSBSupported}
                  className="w-full py-2.5 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {connecting ? <Loader2 size={14} className="animate-spin" /> : <Usb size={14} />}
                  {connecting ? '连接中...' : '一键连接设备'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs">{deviceName || 'Android Device'}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{deviceSerial}</span>
                </div>
                <button onClick={disconnectDevice}
                  className="px-2 py-1 rounded text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">断开</button>
              </div>
            )}
          </div>

          {/* Device Info Panel */}
          {connected && deviceInfo && (
            <div className="px-3 py-2 border-b border-white/5 grid grid-cols-4 gap-2 text-[10px]">
              {deviceInfo.model && (
                <div className="px-2 py-1 rounded bg-white/5">
                  <span className="text-muted-foreground">型号</span>
                  <div className="text-white">{deviceInfo.model}</div>
                </div>
              )}
              {deviceInfo.androidVersion && (
                <div className="px-2 py-1 rounded bg-white/5">
                  <span className="text-muted-foreground">Android</span>
                  <div className="text-white">{deviceInfo.androidVersion}</div>
                </div>
              )}
              {deviceInfo.batteryLevel && (
                <div className="px-2 py-1 rounded bg-white/5">
                  <span className="text-muted-foreground">电量</span>
                  <div className="text-white">{deviceInfo.batteryLevel}</div>
                </div>
              )}
              {deviceInfo.ipAddress && (
                <div className="px-2 py-1 rounded bg-white/5">
                  <span className="text-muted-foreground">IP</span>
                  <div className="text-white font-mono">{deviceInfo.ipAddress}</div>
                </div>
              )}
            </div>
          )}

          {/* Quick Commands */}
          {connected && (
            <div className="p-2 border-b border-white/5">
              <div className="grid grid-cols-3 gap-1">
                {quickCommands.map(cmd => (
                  <button key={cmd.label} onClick={cmd.handler} disabled={executing}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 text-[10px]">
                    <cmd.icon size={10} /> {cmd.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Terminal Logs */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-0.5 min-h-0">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                {log.time && <span className="text-muted-foreground flex-shrink-0">[{log.time}]</span>}
                <span style={{ color: log.color || '#E0E0E0' }}>{log.text}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* IP Tab */}
      {activeTab === 'ip' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Smartphone size={14} className="text-cyan-400" />
              <span className="text-xs">设备 IP (通过 ADB 获取)</span>
            </div>
            <div className="flex gap-2">
              <button onClick={getDeviceIP} disabled={executing || !connected}
                className="px-3 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors disabled:opacity-50">
                获取设备 IP
              </button>
              {ipAddress && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5">
                  <span className="text-xs font-mono">{ipAddress}</span>
                  <button onClick={() => navigator.clipboard.writeText(ipAddress)} className="p-0.5">
                    <Copy size={10} className="text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Wifi size={14} className="text-cyan-400" />
              <span className="text-xs">WiFi 无线调试</span>
            </div>
            <div className="flex gap-2 mb-2">
              <input type="text" value={ipAddress} onChange={e => setIpAddress(e.target.value)} placeholder="设备 IP 地址"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-cyan-400/50" />
              <input type="text" value={port} onChange={e => setPort(e.target.value)} placeholder="端口"
                className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-cyan-400/50 text-center" />
            </div>
            <button onClick={enableWiFiADB} disabled={executing || !connected || !ipAddress}
              className="w-full py-2 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
              {executing ? <Loader2 size={12} className="animate-spin" /> : <Cable size={12} />}
              {executing ? '启用中...' : '启用 WiFi 调试 (adb tcpip)'}
            </button>
          </div>
        </div>
      )}

      {/* Help Tab */}
      {activeTab === 'help' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Info size={14} className="text-cyan-400" /> 工具简介
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              ADB（Android Debug Bridge）网络调试工具，基于 WebUSB API 和 @yume-chan/adb 库实现。
              可以在浏览器中直接连接安卓设备，执行真实的 ADB 命令，无需安装 Android SDK。
            </p>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Usb size={14} className="text-yellow-400" /> 前提条件
            </h3>
            <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
              <li>Chrome / Edge / Opera 浏览器（支持 WebUSB）</li>
              <li>安卓设备开启「开发者选项」→「USB 调试」</li>
              <li>USB 数据线连接手机和电脑</li>
              <li>手机上授权「允许来自此计算机的 USB 调试」</li>
            </ul>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Cable size={14} className="text-green-400" /> USB 连接步骤
            </h3>
            <ol className="text-[11px] text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>用 USB 线将安卓设备连接到电脑</li>
              <li>手机上弹出「允许 USB 调试？」，点击<strong className="text-white">确定</strong></li>
              <li>切换到「ADB 调试」标签页</li>
              <li>点击<strong className="text-white">「一键连接设备」</strong></li>
              <li>在弹出的设备列表中选择你的设备</li>
              <li>等待连接完成，绿色指示灯表示成功</li>
            </ol>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Wifi size={14} className="text-purple-400" /> WiFi 无线调试步骤
            </h3>
            <ol className="text-[11px] text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>先通过 USB 连接设备（见上方步骤）</li>
              <li>切换到「IP 网络调试」标签</li>
              <li>点击「获取设备 IP」自动获取手机 IP</li>
              <li>点击「启用 WiFi 调试」在设备上开启网络端口</li>
              <li>拔掉 USB 线</li>
              <li>重新连接时选择 WiFi 设备即可无线调试</li>
            </ol>
            <div className="mt-2 px-2 py-1.5 rounded bg-yellow-500/10 text-yellow-400 text-[10px]">
              提示：WiFi 调试需要手机和电脑在同一局域网内
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Terminal size={14} className="text-cyan-400" /> 可用快捷命令
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {quickCommands.map(cmd => (
                <div key={cmd.label} className="px-2 py-1.5 rounded bg-white/5 flex items-center gap-1.5">
                  <cmd.icon size={10} className="text-cyan-400 flex-shrink-0" />
                  <span className="text-white">{cmd.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-400" /> 常见问题
            </h3>
            <div className="space-y-2 text-[11px]">
              <div>
                <div className="text-white font-medium">设备未显示在列表中？</div>
                <div className="text-muted-foreground">检查 USB 调试是否开启，尝试更换 USB 端口或数据线</div>
              </div>
              <div>
                <div className="text-white font-medium">连接后显示 unauthorized？</div>
                <div className="text-muted-foreground">手机上需要授权「允许来自此计算机的 USB 调试」</div>
              </div>
              <div>
                <div className="text-white font-medium">按钮点击后无响应？</div>
                <div className="text-muted-foreground">某些设备可能不支持 shell v2 协议，命令会自动回退</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
