import { useState } from 'react';
import { Shield, Globe, Zap, Activity } from 'lucide-react';

interface ProxyNode {
  name: string;
  type: string;
  delay: number;
  country: string;
}

const NODES: ProxyNode[] = [
  { name: 'HK-01', type: 'SS', delay: 45, country: 'HK' },
  { name: 'JP-Tokyo', type: 'VMess', delay: 62, country: 'JP' },
  { name: 'SG-01', type: 'Trojan', delay: 78, country: 'SG' },
  { name: 'US-LA', type: 'SS', delay: 156, country: 'US' },
  { name: 'KR-Seoul', type: 'VMess', delay: 55, country: 'KR' },
  { name: 'TW-01', type: 'SS', delay: 38, country: 'TW' },
];

const LOGS = [
  '[INFO] Clash Core v1.18.0 started',
  '[INFO] RESTful API listening at: 127.0.0.1:9090',
  '[INFO] Mixed proxy listening at: 127.0.0.1:7890',
  '[INFO] Start initial compatible provider default',
  '[INFO] Start initial provider rule',
];

export default function ProxyManager() {
  const [activeNode, setActiveNode] = useState(0);
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <Shield size={18} className="text-cyan-400" />
        <span className="font-bold">Clash Verge</span>
        <button onClick={() => setEnabled(!enabled)}
          className={`px-3 py-1 rounded text-sm ${enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {enabled ? '已连接' : '已断开'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Proxy List */}
        <div className="w-48 border-r border-white/5 p-2">
          <div className="text-xs text-muted-foreground mb-2 px-2">代理节点</div>
          {NODES.map((node, i) => (
            <button key={i} onClick={() => setActiveNode(i)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-white/5 transition-colors"
              style={{ background: i === activeNode ? 'rgba(0, 180, 216, 0.1)' : 'transparent' }}>
              <span className="flex items-center gap-2">
                <Globe size={12} className="text-muted-foreground" />
                {node.name}
              </span>
              <span className={`text-xs ${node.delay < 60 ? 'text-green-400' : node.delay < 100 ? 'text-yellow-400' : 'text-red-400'}`}>{node.delay}ms</span>
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Status */}
          <div className="p-4">
            <div className="glass-panel rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-cyan-400" />
                  <span className="font-medium">{NODES[activeNode].name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">{NODES[activeNode].type}</span>
                </div>
                <div className={`text-sm ${NODES[activeNode].delay < 60 ? 'text-green-400' : 'text-yellow-400'}`}>{NODES[activeNode].delay}ms</div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Activity size={12} /> 上传: 2.4MB/s</span>
                <span className="flex items-center gap-1"><Activity size={12} /> 下载: 15.8MB/s</span>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="text-xs text-muted-foreground mb-2">日志</div>
            {LOGS.map((log, i) => (
              <div key={i} className="text-xs font-mono py-0.5" style={{ color: log.includes('INFO') ? '#5C677D' : '#EEF4ED' }}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
