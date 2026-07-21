import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, MemoryStick } from 'lucide-react';

interface Process {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  user: string;
}

export default function SystemMonitor() {
  const [cpuUsage, setCpuUsage] = useState([30, 45, 35, 50, 40, 55, 45, 60, 50, 55, 48, 52]);
  const [memUsage, setMemUsage] = useState([42, 43, 45, 44, 47, 48, 46, 49, 48, 47, 46, 48]);
  const [processes] = useState<Process[]>([
    { pid: 1, name: 'systemd', cpu: 0.1, mem: 12, user: 'root' },
    { pid: 420, name: 'Hyprland', cpu: 5.2, mem: 156, user: 'user' },
    { pid: 666, name: 'kitty', cpu: 1.8, mem: 45, user: 'user' },
    { pid: 1337, name: 'firefox', cpu: 12.5, mem: 423, user: 'user' },
    { pid: 2048, name: 'code', cpu: 8.3, mem: 312, user: 'user' },
    { pid: 4096, name: 'node', cpu: 15.2, mem: 189, user: 'user' },
    { pid: 8192, name: 'obs', cpu: 22.1, mem: 567, user: 'user' },
    { pid: 1024, name: 'dockerd', cpu: 3.5, mem: 234, user: 'root' },
    { pid: 2049, name: 'qq', cpu: 2.1, mem: 156, user: 'user' },
    { pid: 3072, name: 'wechat', cpu: 4.2, mem: 298, user: 'user' },
    { pid: 512, name: 'pipewire', cpu: 1.2, mem: 34, user: 'user' },
    { pid: 256, name: 'NetworkManager', cpu: 0.5, mem: 28, user: 'root' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => [...prev.slice(1), Math.floor(Math.random() * 30) + 20]);
      setMemUsage(prev => [...prev.slice(1), Math.floor(Math.random() * 15) + 40]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const renderChart = (data: number[], color: string) => {
    const max = Math.max(...data, 1);
    const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-20">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill={`url(#grad-${color})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: 'rgba(0, 18, 51, 0.9)' }}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-3">
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={14} className="text-cyan-400" />
            <span className="text-xs text-muted-foreground">CPU</span>
          </div>
          <div className="text-xl font-mono">{cpuUsage[cpuUsage.length - 1]}%</div>
          {renderChart(cpuUsage, '#00B4D8')}
        </div>
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MemoryStick size={14} className="text-purple-400" />
            <span className="text-xs text-muted-foreground">内存</span>
          </div>
          <div className="text-xl font-mono">{memUsage[memUsage.length - 1]}%</div>
          {renderChart(memUsage, '#7B2CBF')}
        </div>
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={14} className="text-green-400" />
            <span className="text-xs text-muted-foreground">磁盘</span>
          </div>
          <div className="text-xl font-mono">42%</div>
          <div className="w-full h-2 bg-white/10 rounded-full mt-3">
            <div className="h-full bg-green-400 rounded-full" style={{ width: '42%' }} />
          </div>
        </div>
      </div>

      {/* Processes */}
      <div className="flex-1 px-3 pb-3">
        <div className="glass-panel rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
            <Activity size={14} className="text-cyan-400" />
            <span className="text-sm font-medium">进程</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <div className="grid grid-cols-[60px_1fr_50px_50px_60px] gap-2 px-3 py-1.5 text-xs text-muted-foreground border-b border-white/5">
              <span>PID</span>
              <span>名称</span>
              <span>CPU</span>
              <span>内存</span>
              <span>用户</span>
            </div>
            {processes.map(p => (
              <div key={p.pid} className="grid grid-cols-[60px_1fr_50px_50px_60px] gap-2 px-3 py-1.5 text-xs hover:bg-white/5 transition-colors">
                <span className="text-muted-foreground">{p.pid}</span>
                <span>{p.name}</span>
                <span className="text-cyan-400">{p.cpu}%</span>
                <span className="text-purple-400">{p.mem}MB</span>
                <span className="text-muted-foreground">{p.user}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
