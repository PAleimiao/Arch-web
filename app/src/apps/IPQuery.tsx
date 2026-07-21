import { useState, useEffect, useCallback } from 'react';
import { Globe, MapPin, Wifi, Server, Copy, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface IPInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  timezone: string;
}

export default function IPQuery() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localIP, setLocalIP] = useState<string>('检测中...');
  const [copied, setCopied] = useState(false);
  const [dnsInfo, setDnsInfo] = useState<string[]>([]);

  // Get local IP using WebRTC
  const getLocalIP = useCallback(() => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));

      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;

        const ipMatch = ice.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (ipMatch) {
          const ip = ipMatch[1];
          if (ip !== '0.0.0.0' && ip !== '127.0.0.1') {
            setLocalIP(ip);
            pc.close();
          }
        }
      };

      // Fallback timeout
      setTimeout(() => {
        setLocalIP(prev => prev === '检测中...' ? '无法获取（可能被浏览器限制）' : prev);
        pc.close();
      }, 3000);
    } catch {
      setLocalIP('浏览器不支持');
    }
  }, []);

  // Get DNS servers
  const getDNSInfo = useCallback(async () => {
    try {
      // Try to detect DNS using performance timing or navigator
      const dnsList: string[] = [];

      // Check if we can get any DNS hints from the connection
      if ('connection' in navigator && (navigator as any).connection) {
        const conn = (navigator as any).connection;
        if (conn.dns) dnsList.push(conn.dns);
      }

      // Common DNS servers that might be used
      if (dnsList.length === 0) {
        dnsList.push('自动获取 (DHCP)');
      }

      setDnsInfo(dnsList);
    } catch {
      setDnsInfo(['无法获取']);
    }
  }, []);

  // Fetch public IP info
  const fetchIPInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try ipinfo.io first
      const res = await fetch('https://ipinfo.io/json?token=demo', { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        setIpInfo(data);
        return;
      }
    } catch {
      // fallback
    }

    try {
      // Fallback to ipapi.co
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        setIpInfo({
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          loc: `${data.latitude},${data.longitude}`,
          org: data.org || data.asn,
          timezone: data.timezone,
        });
        return;
      }
    } catch {
      // fallback
    }

    try {
      // Final fallback
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        setIpInfo({
          ip: data.ip,
          city: '未知',
          region: '未知',
          country: '未知',
          loc: '--',
          org: '未知',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '未知',
        });
        return;
      }
    } catch {
      setError('无法获取 IP 信息，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIPInfo();
    getLocalIP();
    getDNSInfo();
  }, [fetchIPInfo, getLocalIP, getDNSInfo]);

  const copyIP = useCallback(() => {
    if (ipInfo?.ip) {
      navigator.clipboard.writeText(ipInfo.ip).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [ipInfo]);

  const infoItems = ipInfo ? [
    { icon: Globe, label: '公网 IP', value: ipInfo.ip, copyable: true },
    { icon: Wifi, label: '内网 IP', value: localIP },
    { icon: MapPin, label: '地理位置', value: `${ipInfo.country} ${ipInfo.region} ${ipInfo.city}`.trim() || '未知' },
    { icon: MapPin, label: '经纬度', value: ipInfo.loc },
    { icon: Server, label: '运营商', value: ipInfo.org || '未知' },
    { icon: Globe, label: '时区', value: ipInfo.timezone },
  ] : [];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-cyan-400" />
          <span className="text-sm font-medium">IP 地址查询</span>
        </div>
        <button
          onClick={fetchIPInfo}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          title="刷新"
        >
          <RefreshCw size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={28} className="text-cyan-400 animate-spin mb-3" />
            <div className="text-sm text-muted-foreground">正在查询 IP 信息...</div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle size={28} className="text-red-400 mb-3" />
            <div className="text-sm text-red-400 mb-2">{error}</div>
            <button
              onClick={fetchIPInfo}
              className="px-3 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {!loading && !error && ipInfo && (
          <div className="space-y-3">
            {/* Public IP big display */}
            <div className="glass-panel rounded-xl p-4 text-center" style={{ background: 'rgba(0, 180, 216, 0.08)', border: '1px solid rgba(0, 180, 216, 0.2)' }}>
              <div className="text-xs text-muted-foreground mb-1">公网 IP 地址</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-bold text-cyan-400">{ipInfo.ip}</span>
                <button
                  onClick={copyIP}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  title="复制"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-muted-foreground" />}
                </button>
              </div>
            </div>

            {/* Detail list */}
            {infoItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5"
              >
                <item.icon size={14} className="text-cyan-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-muted-foreground">{item.label}</div>
                  <div className="text-xs font-mono">{item.value}</div>
                </div>
              </div>
            ))}

            {/* Browser info */}
            <div className="glass-panel rounded-xl p-3 mt-2">
              <div className="text-xs text-muted-foreground mb-2">浏览器信息</div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">User-Agent</span>
                  <span className="font-mono text-[10px] max-w-[200px] truncate">{navigator.userAgent}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">语言</span>
                  <span className="font-mono">{navigator.language}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">屏幕分辨率</span>
                  <span className="font-mono">{window.screen.width} x {window.screen.height}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">在线状态</span>
                  <span className={navigator.onLine ? 'text-green-400' : 'text-red-400'}>
                    {navigator.onLine ? '在线' : '离线'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
