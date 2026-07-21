import { useState } from 'react';
import { Type, Search, Check } from 'lucide-react';

const FONTS = [
  { name: 'Noto Sans CJK SC', style: 'Sans-serif', size: '45MB', installed: true },
  { name: 'JetBrains Mono', style: 'Monospace', size: '12MB', installed: true },
  { name: 'Fira Code', style: 'Monospace', size: '8MB', installed: true },
  { name: 'Inter', style: 'Sans-serif', size: '3MB', installed: true },
  { name: 'Source Han Sans', style: 'Sans-serif', size: '38MB', installed: false },
  { name: 'WenQuanYi Micro Hei', style: 'Sans-serif', size: '15MB', installed: true },
  { name: 'Roboto', style: 'Sans-serif', size: '5MB', installed: true },
  { name: 'Ubuntu', style: 'Sans-serif', size: '4MB', installed: false },
  { name: 'Liberation Serif', style: 'Serif', size: '6MB', installed: true },
  { name: 'DejaVu Sans', style: 'Sans-serif', size: '7MB', installed: true },
];

export default function FontManager() {
  const [search, setSearch] = useState('');
  const [fonts, setFonts] = useState(FONTS);

  const toggle = (name: string) => {
    setFonts(fonts.map(f => f.name === name ? { ...f, installed: !f.installed } : f));
  };

  const filtered = fonts.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <Type size={18} className="text-pink-400" />
        <span className="font-bold">字体管理</span>
        <div className="flex-1 max-w-xs">
          <div className="flex items-center gap-2 glass-panel rounded-lg px-3 py-1.5">
            <Search size={14} className="text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索字体..." className="bg-transparent outline-none text-sm flex-1" />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filtered.map(f => (
          <div key={f.name} className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
              <span className="text-xl font-bold" style={{ fontFamily: f.name }}>Ag</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{f.name}</div>
              <div className="text-xs text-muted-foreground">{f.style} · {f.size}</div>
            </div>
            <div className="text-right">
              <div className="text-lg" style={{ fontFamily: f.name }}>ABC 中文</div>
            </div>
            <button onClick={() => toggle(f.name)}
              className={`px-3 py-1.5 rounded-lg text-xs ${f.installed ? 'bg-green-500/20 text-green-400' : 'bg-pink-500/20 text-pink-400'}`}>
              {f.installed ? <span className="flex items-center gap-1"><Check size={12} /> 已安装</span> : '安装'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
