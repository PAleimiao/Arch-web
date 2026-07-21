import { useState } from 'react';
import { Box, Play, Settings, User, Server } from 'lucide-react';

const WORLDS = [
  { name: 'Survival World', mode: '生存', version: '1.20.4', lastPlayed: '2天前', size: '156MB' },
  { name: 'Creative Build', mode: '创造', version: '1.20.4', lastPlayed: '1周前', size: '234MB' },
  { name: 'Redstone Lab', mode: '创造', version: '1.20.1', lastPlayed: '2周前', size: '89MB' },
];

const SERVERS = [
  { name: 'Hypixel', players: '89,234', ping: 45 },
  { name: 'Arch Linux MC', players: '24', ping: 12 },
  { name: 'LocalHost', players: '1', ping: 1 },
];

export default function Minecraft() {
  const [tab, setTab] = useState<'single' | 'multi'>('single');

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #3D1E10 0%, #1A0F0A 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Box size={28} className="text-green-400" />
          <div>
            <div className="text-xl font-bold" style={{ fontFamily: 'serif' }}>Minecraft</div>
            <div className="text-xs text-muted-foreground">Java Edition 1.20.4</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-white/10"><User size={18} /></button>
          <button className="p-2 rounded hover:bg-white/10"><Settings size={18} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 mb-4">
        <button onClick={() => setTab('single')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'single' ? 'bg-white/10' : 'hover:bg-white/5'}`}>单人游戏</button>
        <button onClick={() => setTab('multi')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'multi' ? 'bg-white/10' : 'hover:bg-white/5'}`}>多人游戏</button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {tab === 'single' ? (
          <div className="space-y-2">
            {WORLDS.map(w => (
              <div key={w.name} className="glass-panel rounded-xl p-4 flex items-center gap-4 hover:border-green-400/30 transition-all">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #5D8C38 0%, #3D6C28 100%)' }}>
                  <Box size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{w.name}</div>
                  <div className="text-xs text-muted-foreground">{w.mode} · {w.version} · {w.size}</div>
                  <div className="text-xs text-muted-foreground">上次游玩: {w.lastPlayed}</div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center gap-1.5">
                  <Play size={14} /> 进入世界
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {SERVERS.map(s => (
              <div key={s.name} className="glass-panel rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(93, 140, 56, 0.2)' }}>
                  <Server size={20} className="text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.players} 在线 · {s.ping}ms</div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30">加入</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
