import { useState, useEffect, useRef } from 'react';
import { Wifi, Volume2, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, ChevronDown, Power, RefreshCw, Settings, Cpu, HardDrive, Menu, X } from 'lucide-react';
import RollingClock from './RollingClock';
import { useDesktopStore } from '@/store/desktopStore';

function MiniChart({ color, data }: { color: string; data: number[] }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
  return (
    <svg width="36" height="16" viewBox="0 0 100 100" preserveAspectRatio="none" className="hidden sm:block">
      <polyline points={points} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Battery hook
function useBattery() {
  const [battery, setBattery] = useState<{
    supported: boolean;
    hasBattery: boolean;
    level: number;
    charging: boolean;
  }>({ supported: false, hasBattery: false, level: 1, charging: false });

  useEffect(() => {
    let bat: BatteryManager | null = null;

    const updateBattery = () => {
      if (bat) {
        setBattery({
          supported: true,
          hasBattery: true,
          level: bat.level,
          charging: bat.charging,
        });
      }
    };

    if ('getBattery' in navigator && navigator.getBattery) {
      navigator.getBattery().then((b) => {
        bat = b;
        updateBattery();

        // Check if this is actually a battery-powered device
        // Desktop usually reports level=1 and charging=true permanently
        // We'll show battery if level < 0.99 or not charging (indicating real battery)
        const isRealBattery = b.level < 0.99 || !b.charging;
        if (!isRealBattery) {
          setBattery(prev => ({ ...prev, hasBattery: false }));
        }

        b.addEventListener('levelchange', updateBattery);
        b.addEventListener('chargingchange', updateBattery);
      }).catch(() => {
        setBattery({ supported: false, hasBattery: false, level: 1, charging: false });
      });
    }

    return () => {
      if (bat) {
        bat.removeEventListener('levelchange', updateBattery);
        bat.removeEventListener('chargingchange', updateBattery);
      }
    };
  }, []);

  return battery;
}

interface TopBarProps {
  onShutdown?: () => void;
  onRestart?: () => void;
}

export default function TopBar({ onShutdown, onRestart }: TopBarProps) {
  const { setLauncherOpen, openWindow } = useDesktopStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cpuData, setCpuData] = useState([30, 45, 35, 50, 40, 55, 45, 60, 50, 55]);
  const [memData, setMemData] = useState([40, 42, 45, 43, 48, 50, 47, 52, 49, 46]);
  const battery = useBattery();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuData(prev => [...prev.slice(1), Math.floor(Math.random() * 40) + 20]);
      setMemData(prev => [...prev.slice(1), Math.floor(Math.random() * 30) + 35]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpenTerminal = () => openWindow('terminal', '终端', 700, 450);

  const batteryLevel = Math.round(battery.level * 100);

  // Choose battery icon based on level and charging state
  const BatteryIcon = () => {
    if (battery.charging) return <BatteryCharging size={14} className="text-green-400" />;
    if (batteryLevel <= 20) return <BatteryLow size={14} className="text-red-400" />;
    if (batteryLevel <= 50) return <BatteryMedium size={14} className="text-yellow-400" />;
    return <BatteryFull size={14} className="text-green-400" />;
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-10 z-[9999] glass-panel flex items-center justify-between px-2 sm:px-3 select-none"
      style={{ borderBottom: '1px solid rgba(0, 180, 216, 0.1)' }}>

      {/* Left */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Mobile menu button */}
        <button className="show-mobile-only p-1.5 rounded hover:bg-white/10" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* CXL--PACKAGE Logo */}
        <div className="flex items-center gap-1.5 select-none">
          <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #00B4D8, #7B2CBF)', letterSpacing: '0.5px' }}>
            CXL
          </div>
          <span className="text-[10px] font-mono font-semibold tracking-wider hidden sm:block"
            style={{ color: 'rgba(0, 180, 216, 0.85)' }}>
            CXL--PACKAGE
          </span>
        </div>

        <div className="w-px h-4 bg-white/10 hidden sm:block" />

        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-1 hover:bg-white/5 rounded px-1.5 py-0.5 transition-colors">
            <img src="/icons/arch-logo.png" alt="Arch" className="w-5 h-5" />
            <ChevronDown size={12} className="text-muted-foreground hidden sm:block" />
          </button>

          {showMenu && (
            <div className="absolute top-full left-0 mt-1 w-44 glass-panel-strong rounded-lg py-1.5 animate-fadeIn"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <button onClick={() => { setShowMenu(false); openWindow('settings', '系统设置', 700, 520); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left">
                <Settings size={14} className="text-cyan-400" /> 系统设置
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button onClick={() => { setShowMenu(false); onRestart?.(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left">
                <RefreshCw size={14} className="text-yellow-400" /> 重启
              </button>
              <button onClick={() => { setShowMenu(false); onShutdown?.(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left">
                <Power size={14} className="text-red-400" /> 关机
              </button>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <button onClick={handleOpenTerminal} className="hover:text-foreground transition-colors px-1">文件(F)</button>
          <button onClick={handleOpenTerminal} className="hover:text-foreground transition-colors px-1">编辑(E)</button>
          <button onClick={handleOpenTerminal} className="hover:text-foreground transition-colors px-1">视图(V)</button>
          <button onClick={handleOpenTerminal} className="hover:text-foreground transition-colors px-1">终端(T)</button>
          <button onClick={() => setLauncherOpen(true)} className="hover:text-foreground transition-colors px-1">帮助(H)</button>
        </div>
      </div>

      {/* Center - System Stats (desktop only) */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Cpu size={12} className="text-cyan-400" />
          <MiniChart color="#00B4D8" data={cpuData} />
        </div>
        <div className="flex items-center gap-1">
          <HardDrive size={12} className="text-purple-400" />
          <MiniChart color="#7B2CBF" data={memData} />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Wifi size={14} />
          <span className="text-xs hidden sm:inline">WiFi</span>
        </div>
        <div className="text-muted-foreground">
          <Volume2 size={14} />
        </div>

        {/* Battery - only show on battery-powered devices */}
        {battery.hasBattery && (
          <div className="flex items-center gap-1 text-muted-foreground" title={`电池: ${batteryLevel}%${battery.charging ? ' (充电中)' : ''}`}>
            <BatteryIcon />
            <span className="text-xs">{batteryLevel}%</span>
          </div>
        )}

        <RollingClock />
      </div>

      {/* Mobile Dropdown Menu */}
      {showMobileMenu && (
        <div className="show-mobile-only fixed top-10 left-0 right-0 glass-panel-strong py-2 animate-slideDown"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {['文件(F)', '编辑(E)', '视图(V)', '终端(T)', '帮助(H)'].map((label) => (
            <button key={label} onClick={() => { setShowMobileMenu(false); handleOpenTerminal(); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
