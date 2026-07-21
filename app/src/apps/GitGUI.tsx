import { useState } from 'react';
import { GitBranch, Check } from 'lucide-react';

const COMMITS = [
  { hash: 'a1b2c3d', message: 'feat: add hyprland config', author: 'user', date: '2h ago', branch: 'main' },
  { hash: 'e4f5g6h', message: 'fix: resolve network issue', author: 'user', date: '5h ago', branch: 'main' },
  { hash: 'i7j8k9l', message: 'docs: update README', author: 'user', date: '1d ago', branch: 'main' },
  { hash: 'm0n1o2p', message: 'feat: add waybar config', author: 'user', date: '2d ago', branch: 'feature/waybar' },
  { hash: 'q3r4s5t', message: 'chore: update packages', author: 'user', date: '3d ago', branch: 'main' },
];

const BRANCHES = ['main', 'feature/waybar', 'feature/rofi', 'hotfix/network', 'dev'];

export default function GitGUI() {
  const [activeBranch, setActiveBranch] = useState('main');
  const [tab, setTab] = useState<'commits' | 'branches' | 'changes'>('commits');

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <GitBranch size={18} className="text-orange-400" />
          <span className="font-bold">Git 仓库</span>
        </div>
        <div className="flex gap-1">
          {(['commits', 'branches', 'changes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded text-sm ${tab === t ? 'bg-white/10' : 'hover:bg-white/5'}`}>
              {t === 'commits' ? '提交' : t === 'branches' ? '分支' : '更改'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'commits' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">{activeBranch}</span>
            <span className="text-xs text-muted-foreground">{COMMITS.length} commits</span>
          </div>
          {COMMITS.map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
              <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm">{c.message}</div>
                <div className="text-xs text-muted-foreground">{c.hash} · {c.author} · {c.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'branches' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {BRANCHES.map(b => (
            <button key={b} onClick={() => setActiveBranch(b)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left">
              <GitBranch size={14} className={b === activeBranch ? 'text-cyan-400' : 'text-muted-foreground'} />
              <span className="text-sm">{b}</span>
              {b === activeBranch && <Check size={14} className="text-green-400 ml-auto" />}
            </button>
          ))}
        </div>
      )}
      {tab === 'changes' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            <div className="text-xs text-green-400 mb-2">已暂存</div>
            <div className="flex items-center gap-2 px-3 py-2 glass-panel rounded-lg">
              <Check size={14} className="text-green-400" />
              <span className="text-sm">hyprland.conf</span>
              <span className="text-xs text-green-400 ml-auto">+45 -3</span>
            </div>
            <div className="text-xs text-muted-foreground mb-2 mt-3">未暂存</div>
            <div className="flex items-center gap-2 px-3 py-2 glass-panel rounded-lg">
              <span className="text-sm">waybar/config.jsonc</span>
              <span className="text-xs text-yellow-400 ml-auto">M</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
