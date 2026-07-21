import { useState, useEffect } from 'react';
import { Activity, Wifi } from 'lucide-react';

interface Packet {
  id: number;
  time: string;
  src: string;
  dst: string;
  protocol: string;
  length: number;
  info: string;
}

const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'DNS', 'ICMP', 'TLS'];
const IPS = ['192.168.1.1', '192.168.1.42', '8.8.8.8', '1.1.1.1', '140.82.121.4', '151.101.1.140'];

export default function NetworkAnalyzer() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [capturing, setCapturing] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!capturing) return;
    const interval = setInterval(() => {
      const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
      const newPacket: Packet = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        src: IPS[Math.floor(Math.random() * IPS.length)],
        dst: IPS[Math.floor(Math.random() * IPS.length)],
        protocol,
        length: Math.floor(Math.random() * 1400) + 40,
        info: `${protocol} ${Math.floor(Math.random() * 65535)} → ${Math.floor(Math.random() * 65535)} [${Math.random() > 0.5 ? 'SYN' : 'ACK'}]`,
      };
      setPackets(prev => [newPacket, ...prev].slice(0, 100));
    }, 800);
    return () => clearInterval(interval);
  }, [capturing]);

  const filtered = packets.filter(p => !filter || p.protocol.toLowerCase().includes(filter.toLowerCase()));

  const protocolColor = (p: string) => {
    switch (p) {
      case 'TCP': return 'text-green-400';
      case 'UDP': return 'text-cyan-400';
      case 'HTTP': return 'text-blue-400';
      case 'DNS': return 'text-yellow-400';
      case 'ICMP': return 'text-red-400';
      case 'TLS': return 'text-purple-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <Activity size={18} className="text-cyan-400" />
        <span className="font-bold">Wireshark</span>
        <button onClick={() => setCapturing(!capturing)}
          className={`px-3 py-1 rounded text-sm ${capturing ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {capturing ? '● 捕获中' : '○ 已停止'}
        </button>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="过滤协议..." className="glass-panel rounded px-2 py-1 text-xs outline-none w-32" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_70px_120px_120px_60px_60px_1fr] gap-1 px-3 py-1.5 text-xs text-muted-foreground border-b border-white/5 sticky top-0" style={{ background: 'rgba(0,18,51,0.95)' }}>
          <span>编号</span><span>时间</span><span>源地址</span><span>目标地址</span><span>协议</span><span>长度</span><span>信息</span>
        </div>
        {filtered.map(p => (
          <div key={p.id} className="grid grid-cols-[60px_70px_120px_120px_60px_60px_1fr] gap-1 px-3 py-1 text-xs hover:bg-white/5 transition-colors">
            <span className="text-muted-foreground">{p.id.toString().slice(-4)}</span>
            <span>{p.time}</span>
            <span>{p.src}</span>
            <span>{p.dst}</span>
            <span className={protocolColor(p.protocol)}>{p.protocol}</span>
            <span>{p.length}</span>
            <span className="truncate">{p.info}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 px-3 py-2 border-t border-white/5 text-xs text-muted-foreground">
        <span>{filtered.length} 个数据包</span>
        <Wifi size={12} /> <span>wlan0</span>
      </div>
    </div>
  );
}
