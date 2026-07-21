import { useState } from 'react';
import { Search, Download, Star, Sparkles } from 'lucide-react';

interface AppItem {
  name: string;
  category: string;
  rating: number;
  downloads: string;
  size: string;
  installed: boolean;
}

const APPS: AppItem[] = [
  { name: 'QQ', category: '社交', rating: 4.5, downloads: '2.3M', size: '156MB', installed: true },
  { name: '微信', category: '社交', rating: 4.3, downloads: '3.1M', size: '189MB', installed: true },
  { name: 'WPS Office', category: '办公', rating: 4.4, downloads: '1.8M', size: '312MB', installed: true },
  { name: '网易云音乐', category: '影音', rating: 4.6, downloads: '2.1M', size: '98MB', installed: true },
  { name: '腾讯会议', category: '社交', rating: 4.2, downloads: '890K', size: '145MB', installed: true },
  { name: 'OBS Studio', category: '影音', rating: 4.8, downloads: '1.5M', size: '156MB', installed: true },
  { name: 'VS Code', category: '开发', rating: 4.9, downloads: '3.2M', size: '89MB', installed: true },
  { name: '火狐浏览器', category: '网络', rating: 4.5, downloads: '1.2M', size: '67MB', installed: true },
  { name: '百度网盘', category: '网络', rating: 3.8, downloads: '2.5M', size: '123MB', installed: true },
  { name: 'Steam', category: '游戏', rating: 4.7, downloads: '2.8M', size: '456MB', installed: true },
  { name: 'Typora', category: '办公', rating: 4.6, downloads: '560K', size: '78MB', installed: true },
  { name: '迅雷', category: '网络', rating: 4.0, downloads: '1.1M', size: '98MB', installed: true },
  { name: '腾讯视频', category: '影音', rating: 4.1, downloads: '1.9M', size: '134MB', installed: false },
  { name: 'GIMP', category: '图形', rating: 4.4, downloads: '780K', size: '156MB', installed: false },
  { name: 'VLC', category: '影音', rating: 4.5, downloads: '2.0M', size: '45MB', installed: false },
];

const CATEGORIES = ['全部', '推荐', '社交', '影音', '办公', '开发', '图形', '游戏', '网络'];

export default function SparkStore() {
  const [activeCat, setActiveCat] = useState('全部');
  const [search, setSearch] = useState('');
  const [apps, setApps] = useState(APPS);
  
  const filtered = apps.filter(a => {
    const matchCat = activeCat === '全部' || activeCat === '推荐' || a.category === activeCat;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleInstall = (name: string) => {
    setApps(apps.map(a => a.name === name ? { ...a, installed: !a.installed } : a));
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-red-400" />
          <span className="font-bold text-lg">星火应用商店</span>
        </div>
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 glass-panel rounded-lg px-3 py-1.5">
            <Search size={14} className="text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索应用..." className="bg-transparent outline-none text-sm flex-1" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-40 border-r border-white/5 p-3 space-y-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ background: activeCat === cat ? 'rgba(230, 0, 18, 0.15)' : 'transparent', color: activeCat === cat ? '#FF4D4D' : '#979DAC' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(app => (
              <div key={app.name} className="glass-panel rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `hsl(${app.name.charCodeAt(0) * 15}, 50%, 30%)` }}>
                  <span className="text-lg font-bold">{app.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{app.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Star size={10} className="text-yellow-400" /> {app.rating}
                    <Download size={10} /> {app.downloads}
                    <span>{app.size}</span>
                  </div>
                </div>
                <button onClick={() => toggleInstall(app.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${app.installed ? 'bg-white/5 hover:bg-white/10 text-muted-foreground' : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'}`}>
                  {app.installed ? '已安装' : '安装'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
