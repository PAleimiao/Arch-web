import { useState } from 'react';
import { Clock, RotateCw, HardDrive } from 'lucide-react';

const SNAPSHOTS = [
  { name: 'Snapshot_2026-07-01', size: '12.5GB', date: '2026-07-01 03:00', type: '自动' },
  { name: 'Snapshot_2026-06-28', size: '12.1GB', date: '2026-06-28 03:00', type: '自动' },
  { name: 'pre-hyprland-update', size: '11.8GB', date: '2026-06-25 14:30', type: '手动' },
  { name: 'Snapshot_2026-06-24', size: '11.9GB', date: '2026-06-24 03:00', type: '自动' },
  { name: 'fresh-install', size: '8.5GB', date: '2026-06-01 10:00', type: '手动' },
];

export default function BackupTool() {
  const [, setRestoring] = useState(false);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <Clock size={18} className="text-cyan-400" />
        <span className="font-bold">Timeshift</span>
      </div>

      <div className="p-4">
        <div className="glass-panel rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive size={20} className="text-cyan-400" />
            <div>
              <div className="font-medium">系统快照</div>
              <div className="text-xs text-muted-foreground">自动备份每日执行</div>
            </div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: '45%' }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>已用 58GB / 128GB</span>
            <span>5 个快照</span>
          </div>
        </div>

        <button className="w-full py-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors mb-4 flex items-center justify-center gap-2">
          <RotateCw size={16} /> 立即创建快照
        </button>

        <div className="text-xs text-muted-foreground mb-2">快照列表</div>
        <div className="space-y-1">
          {SNAPSHOTS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
              <Clock size={14} className="text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.date} · {s.size} · {s.type}</div>
              </div>
              <button onClick={() => setRestoring(true)} className="px-2 py-1 rounded text-xs bg-white/5 hover:bg-white/10 transition-colors">
                恢复
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
