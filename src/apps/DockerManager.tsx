import { useState } from 'react';
import { Container, Play, Square, Trash2 } from 'lucide-react';

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused';
  ports: string;
  uptime: string;
}

const INITIAL: DockerContainer[] = [
  { id: 'a1b2c3d', name: 'nginx-proxy', image: 'nginx:alpine', status: 'running', ports: '80:80, 443:443', uptime: '3 days' },
  { id: 'e4f5g6h', name: 'mysql-db', image: 'mysql:8.0', status: 'running', ports: '3306:3306', uptime: '3 days' },
  { id: 'i7j8k9l', name: 'redis-cache', image: 'redis:alpine', status: 'running', ports: '6379:6379', uptime: '2 days' },
  { id: 'm0n1o2p', name: 'app-server', image: 'node:20-alpine', status: 'stopped', ports: '3000:3000', uptime: '--' },
  { id: 'q3r4s5t', name: 'postgres-db', image: 'postgres:16', status: 'running', ports: '5432:5432', uptime: '1 day' },
  { id: 'u6v7w8x', name: 'gitlab-runner', image: 'gitlab/gitlab-runner', status: 'paused', ports: '--', uptime: '12 hours' },
];

export default function DockerManager() {
  const [containers, setContainers] = useState(INITIAL);
  const [tab, setTab] = useState<'containers' | 'images' | 'volumes'>('containers');

  const toggleStatus = (id: string) => {
    setContainers(containers.map(c => {
      if (c.id !== id) return c;
      return { ...c, status: c.status === 'running' ? 'stopped' : 'running' as 'running' | 'stopped' | 'paused', uptime: c.status === 'running' ? '--' : 'Just now' };
    }));
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'running': return 'text-green-400';
      case 'stopped': return 'text-red-400';
      case 'paused': return 'text-yellow-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Container size={18} className="text-blue-400" />
          <span className="font-bold">Docker Desktop</span>
        </div>
        <div className="flex gap-1">
          {(['containers', 'images', 'volumes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded text-sm transition-colors ${tab === t ? 'bg-white/10' : 'hover:bg-white/5'}`}>
              {t === 'containers' ? '容器' : t === 'images' ? '镜像' : '卷'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'containers' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {containers.map(c => (
            <div key={c.id} className="glass-panel rounded-lg p-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(36, 150, 237, 0.15)' }}>
                <Container size={20} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{c.name}</span>
                  <span className={`text-xs ${statusColor(c.status)}`}>● {c.status === 'running' ? '运行中' : c.status === 'stopped' ? '已停止' : '已暂停'}</span>
                </div>
                <div className="text-xs text-muted-foreground">{c.image} · {c.ports} · {c.uptime}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleStatus(c.id)} className="p-1.5 rounded hover:bg-white/10">
                  {c.status === 'running' ? <Square size={14} className="text-red-400" /> : <Play size={14} className="text-green-400" />}
                </button>
                <button className="p-1.5 rounded hover:bg-white/10"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'images' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-center text-muted-foreground py-12">
            <Container size={48} className="mx-auto mb-4" />
            <div>6 个镜像 · 共 4.2GB</div>
          </div>
        </div>
      )}
      {tab === 'volumes' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-center text-muted-foreground py-12">4 个数据卷 · 共 1.8GB</div>
        </div>
      )}
    </div>
  );
}
