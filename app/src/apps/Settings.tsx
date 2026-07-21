import { useState, useEffect } from 'react';
import { Palette, Wifi, Volume2, User, Shield, Keyboard, Monitor, Info, Cpu, Globe, Smartphone, Battery, AlertTriangle, Moon } from 'lucide-react';
import { useDesktopStore } from '@/store/desktopStore';

const SETTINGS_CATEGORIES = [
  { id: 'display', name: '显示', icon: Monitor },
  { id: 'appearance', name: '外观', icon: Palette },
  { id: 'network', name: '网络', icon: Wifi },
  { id: 'sound', name: '声音', icon: Volume2 },
  { id: 'user', name: '用户', icon: User },
  { id: 'privacy', name: '隐私', icon: Shield },
  { id: 'keyboard', name: '键盘', icon: Keyboard },
  { id: 'about', name: '关于', icon: Info },
];

// Hook to get device info
function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({
    platform: '',
    cores: 0,
    memory: '',
    resolution: '',
    browser: '',
    language: '',
    online: true,
    userAgent: '',
    hasBattery: false,
    batteryLevel: 100,
    batteryCharging: false,
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    const browser = (() => {
      if (ua.includes('Edg/')) return 'Microsoft Edge';
      if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Google Chrome';
      if (ua.includes('Firefox/')) return 'Mozilla Firefox';
      if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Apple Safari';
      return 'Unknown Browser';
    })();

    const platform = (() => {
      if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
      if (/Android/.test(ua)) return 'Android';
      if (/Win/.test(ua)) return 'Windows';
      if (/Mac/.test(ua)) return 'macOS';
      if (/Linux/.test(ua)) return 'Linux';
      return 'Unknown';
    })();

    const updateInfo = {
      platform,
      cores: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'Unknown',
      resolution: `${window.screen.width} x ${window.screen.height}`,
      browser,
      language: navigator.language,
      online: navigator.onLine,
      userAgent: ua,
      hasBattery: false,
      batteryLevel: 100,
      batteryCharging: false,
    };

    setDeviceInfo(updateInfo);

    // Try to get battery info
    if ('getBattery' in navigator && navigator.getBattery) {
      navigator.getBattery().then((bat) => {
        setDeviceInfo(prev => ({
          ...prev,
          hasBattery: true,
          batteryLevel: Math.round(bat.level * 100),
          batteryCharging: bat.charging,
        }));
      }).catch(() => {});
    }

    const handleOnline = () => setDeviceInfo(prev => ({ ...prev, online: true }));
    const handleOffline = () => setDeviceInfo(prev => ({ ...prev, online: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return deviceInfo;
}

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState('display');
  const { settings, updateSettings } = useDesktopStore();
  const deviceInfo = useDeviceInfo();

  const renderContent = () => {
    switch (activeCategory) {
      case 'display':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">显示设置</h3>
            <div className="space-y-3">
              <div className="glass-panel rounded-lg p-4">
                <label className="text-sm text-muted-foreground">分辨率</label>
                <select className="w-full mt-1 glass-panel rounded px-3 py-2 text-sm outline-none">
                  <option>1920 x 1080 (推荐)</option>
                  <option>2560 x 1440</option>
                  <option>3840 x 2160</option>
                </select>
              </div>
              <div className="glass-panel rounded-lg p-4">
                <label className="text-sm text-muted-foreground">刷新率</label>
                <select className="w-full mt-1 glass-panel rounded px-3 py-2 text-sm outline-none">
                  <option>60 Hz</option>
                  <option selected>144 Hz</option>
                  <option>240 Hz</option>
                </select>
              </div>
              <div className="glass-panel rounded-lg p-4">
                <label className="text-sm text-muted-foreground">缩放</label>
                <input type="range" min="100" max="200" defaultValue="100" className="w-full mt-2 accent-cyan-400" />
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">外观设置</h3>
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] border border-yellow-500/30">
                实验性功能
              </span>
            </div>

            {/* Experimental warning */}
            <div className="glass-panel rounded-lg p-3 bg-yellow-500/10 border-yellow-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  以下功能为实验性特性，目前仅支持移动端设备。桌面端的部分视觉效果可能受限。
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="glass-panel rounded-lg p-4">
                <label className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>壁纸</span>
                  <span className="text-[10px] text-yellow-400">实验性</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    className="aspect-video rounded-lg overflow-hidden border-2 border-cyan-400 relative group"
                    onClick={() => alert('壁纸切换功能正在开发中，当前仅支持移动端浏览器')}
                  >
                    <video src="/videos/wallpaper.mp4" className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white">动态壁纸</span>
                    </div>
                  </button>
                  <button
                    className="aspect-video rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-colors relative group"
                    onClick={() => alert('壁纸切换功能正在开发中，当前仅支持移动端浏览器')}
                  >
                    <img src="/images/wallpaper-fallback.jpg" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white">静态壁纸</span>
                    </div>
                  </button>
                  <button
                    className="aspect-video rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-colors relative group"
                    style={{ background: '#0a0a1a' }}
                    onClick={() => alert('壁纸切换功能正在开发中，当前仅支持移动端浏览器')}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Moon size={20} className="text-muted-foreground" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white">深色纯色</span>
                    </div>
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  提示：点击壁纸可预览，实际切换功能需浏览器支持（仅限移动端）
                </p>
              </div>

              <div className="glass-panel rounded-lg p-4">
                <label className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>透明度</span>
                  <span className="text-[10px] text-yellow-400">实验性</span>
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.05"
                  value={settings.transparency}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateSettings({ transparency: val });
                    // Apply transparency to root element for mobile
                    if (window.innerWidth <= 768) {
                      document.documentElement.style.setProperty('--glass-opacity', String(val));
                    }
                  }}
                  className="w-full mt-2 accent-cyan-400"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  当前值: {Math.round(settings.transparency * 100)}% {window.innerWidth > 768 && '(桌面端预览)'}
                </p>
              </div>

              <div className="glass-panel rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm">深色模式</span>
                  <span className="ml-2 text-[10px] text-yellow-400">实验性</span>
                </div>
                <div className="w-10 h-5 rounded-full bg-cyan-400/30 relative cursor-pointer"
                  onClick={() => alert('深色模式切换正在开发中，当前跟随系统设置')}>
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-cyan-400" />
                </div>
              </div>

              <div className="glass-panel rounded-lg p-4">
                <label className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>亮度</span>
                  <span className="text-[10px] text-yellow-400">仅限手机端</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  defaultValue="100"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    // Only works on mobile with screen brightness API
                    if ('screen' in window && 'brightness' in (window.screen as any)) {
                      try {
                        (window.screen as any).brightness = val / 100;
                      } catch {
                        alert('亮度调节需要设备支持，当前浏览器不支持此功能');
                      }
                    } else {
                      alert('亮度调节功能仅限支持 Screen Brightness API 的移动端设备');
                    }
                  }}
                  className="w-full mt-2 accent-cyan-400"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  提示：亮度调节需要设备支持 Screen Brightness API（仅限手机端）
                </p>
              </div>
            </div>
          </div>
        );
      case 'network':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">网络设置</h3>
            <div className="space-y-3">
              <div className="glass-panel rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi size={18} className="text-cyan-400" />
                  <div>
                    <div className="text-sm">Wi-Fi</div>
                    <div className="text-xs text-muted-foreground">已连接到 Arch-Linux-5G</div>
                  </div>
                </div>
                <div className="w-10 h-5 rounded-full bg-cyan-400/30 relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-cyan-400" />
                </div>
              </div>
              <div className="glass-panel rounded-lg p-4">
                <label className="text-sm text-muted-foreground">IP 地址</label>
                <div className="text-sm mt-1 font-mono">192.168.1.42</div>
              </div>
            </div>
          </div>
        );
      case 'sound':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">声音设置</h3>
            <div className="space-y-3">
              <div className="glass-panel rounded-lg p-4">
                <label className="text-sm text-muted-foreground">输出音量</label>
                <input type="range" defaultValue="75" className="w-full mt-2 accent-cyan-400" />
              </div>
              <div className="glass-panel rounded-lg p-4">
                <label className="text-sm text-muted-foreground">输入音量</label>
                <input type="range" defaultValue="60" className="w-full mt-2 accent-cyan-400" />
              </div>
            </div>
          </div>
        );
      case 'user':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">用户信息</h3>
            <div className="flex items-center gap-4 glass-panel rounded-lg p-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl font-bold">
                A
              </div>
              <div>
                <div className="font-medium">Arch User</div>
                <div className="text-sm text-muted-foreground">user@archlinux</div>
              </div>
            </div>
          </div>
        );
      case 'about':
        return <AboutPage deviceInfo={deviceInfo} />;
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{SETTINGS_CATEGORIES.find(c => c.id === activeCategory)?.name || '设置'}</h3>
            <div className="glass-panel rounded-lg p-8 text-center text-muted-foreground">
              此设置页面正在开发中...
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex" style={{ background: 'rgba(0, 18, 51, 0.9)' }}>
      {/* Sidebar */}
      <div className="w-48 border-r border-white/5 py-2">
        {SETTINGS_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
              style={{
                background: activeCategory === cat.id ? 'rgba(0, 180, 216, 0.15)' : 'transparent',
                color: activeCategory === cat.id ? '#00B4D8' : '#979DAC',
              }}
            >
              <Icon size={16} />
              {cat.name}
            </button>
          );
        })}
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}

// About Page Component
function AboutPage({ deviceInfo }: { deviceInfo: ReturnType<typeof useDeviceInfo> }) {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}小时 ${m}分 ${sec}秒`;
  };

  const infoItems = [
    { icon: Cpu, label: '处理器', value: `${deviceInfo.cores} 核` },
    { icon: Globe, label: '浏览器', value: deviceInfo.browser },
    { icon: Smartphone, label: '平台', value: deviceInfo.platform },
    { icon: Monitor, label: '分辨率', value: deviceInfo.resolution },
    { icon: Wifi, label: '网络状态', value: deviceInfo.online ? '在线' : '离线' },
    { icon: Info, label: '系统语言', value: deviceInfo.language },
    ...(deviceInfo.hasBattery ? [
      { icon: Battery, label: '电池电量', value: `${deviceInfo.batteryLevel}%${deviceInfo.batteryCharging ? ' (充电中)' : ''}` },
    ] : []),
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">关于</h3>

      {/* System Branding */}
      <div className="glass-panel rounded-xl p-6 flex items-center gap-5">
        <img src="/icons/arch-logo.png" alt="Arch" className="w-20 h-20" style={{ filter: 'drop-shadow(0 0 12px rgba(0,180,216,0.4))' }} />
        <div>
          <div className="text-xl font-bold">Arch Linux Web Simulator</div>
          <div className="text-sm text-muted-foreground">基于 Web 的 Linux 桌面环境模拟器</div>
          <div className="text-xs text-muted-foreground mt-1">版本 1.0.0 | Hyprland 风格</div>
        </div>
      </div>

      {/* Device Info */}
      <div className="glass-panel rounded-xl p-4">
        <h4 className="text-sm font-medium mb-3">设备信息</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
              <item.icon size={16} className="text-cyan-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-sm">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Runtime Info */}
      <div className="glass-panel rounded-xl p-4">
        <h4 className="text-sm font-medium mb-3">运行状态</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
            <span className="text-sm text-muted-foreground">运行时间</span>
            <span className="text-sm font-mono">{formatUptime(uptime)}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
            <span className="text-sm text-muted-foreground">内存</span>
            <span className="text-sm">{deviceInfo.memory}</span>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-panel rounded-xl p-4">
        <h4 className="text-sm font-medium mb-3">技术栈</h4>
        <div className="flex flex-wrap gap-2">
          {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand', 'shadcn/ui', 'HTML5 Canvas', 'Web Audio API', 'Battery API'].map(tag => (
            <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-xs text-muted-foreground border border-white/5">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-xs text-muted-foreground pt-2">
        <div>基于 Web 技术构建 | 仅供学习娱乐</div>
        <div className="mt-1">© 2026 Arch Linux Web Simulator</div>
      </div>
    </div>
  );
}
