import { useState } from 'react';
import { KeyRound, Copy, Eye, EyeOff, Search } from 'lucide-react';

interface PasswordItem {
  id: number;
  site: string;
  username: string;
  password: string;
}

const SAMPLES: PasswordItem[] = [
  { id: 1, site: 'GitHub', username: 'arch_user', password: 'ghp_xxxxxxxxxxxx' },
  { id: 2, site: 'Arch Linux AUR', username: 'arch_fan', password: '****************' },
  { id: 3, site: '阿里云', username: 'admin', password: 'Akxxxxxxxxxxxxxx' },
  { id: 4, site: '网易云音乐', username: 'music_lover', password: '****************' },
  { id: 5, site: 'QQ', username: '123456789', password: '****************' },
];

export default function PasswordManager() {
  const [items] = useState(SAMPLES);
  const [showPass, setShowPass] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<number | null>(null);

  const toggleShow = (id: number) => {
    const next = new Set(showPass);
    if (next.has(id)) next.delete(id); else next.add(id);
    setShowPass(next);
  };

  const copyPass = (id: number, pass: string) => {
    navigator.clipboard?.writeText(pass);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = items.filter(i => i.site.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-3 p-3 border-b border-white/5">
        <KeyRound size={18} className="text-green-400" />
        <span className="font-bold">密码管理</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1 glass-panel rounded-lg px-2 py-1">
          <Search size={12} className="text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="bg-transparent outline-none text-xs w-20" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map(item => (
          <div key={item.id} className="glass-panel rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{item.site}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => copyPass(item.id, item.password)} className="p-1 rounded hover:bg-white/10">
                  <Copy size={12} className={copied === item.id ? 'text-green-400' : 'text-muted-foreground'} />
                </button>
                <button onClick={() => toggleShow(item.id)} className="p-1 rounded hover:bg-white/10">
                  {showPass.has(item.id) ? <EyeOff size={12} /> : <Eye size={12} className="text-muted-foreground" />}
                </button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{item.username}</div>
            <div className="text-xs font-mono mt-0.5" style={{ color: showPass.has(item.id) ? '#EEF4ED' : '#5C677D' }}>
              {showPass.has(item.id) ? item.password : '••••••••••••••••'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
