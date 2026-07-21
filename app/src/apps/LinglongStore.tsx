import { useState } from 'react';
import { Search, Download, Package, Check } from 'lucide-react';

interface LinglongApp {
  name: string;
  description: string;
  version: string;
  size: string;
  installed: boolean;
}

const LINGLONG_APPS: LinglongApp[] = [
  { name: 'org.deepin.browser', description: 'Deepin 浏览器', version: '6.0.22', size: '89MB', installed: false },
  { name: 'org.deepin.music', description: '深度音乐', version: '7.0.3', size: '45MB', installed: true },
  { name: 'org.deepin.movie', description: '深度影院', version: '5.10.10', size: '67MB', installed: false },
  { name: 'org.deepin.editor', description: '深度编辑器', version: '5.10.13', size: '12MB', installed: true },
  { name: 'org.deepin.calculator', description: '深度计算器', version: '5.7.7', size: '8MB', installed: true },
  { name: 'org.deepin.draw', description: '深度画板', version: '6.0.5', size: '34MB', installed: false },
  { name: 'org.deepin.mail', description: '深度邮箱', version: '5.10.4', size: '56MB', installed: false },
  { name: 'org.deepin.reader', description: '深度文档查看器', version: '5.10.14', size: '23MB', installed: false },
  { name: 'com.qq.weixin', description: '微信', version: '3.9.10', size: '189MB', installed: true },
  { name: 'com.tencent.qq', description: 'QQ', version: '9.7.23', size: '156MB', installed: true },
  { name: 'com.visualstudio.code', description: 'VS Code', version: '1.85.1', size: '89MB', installed: true },
  { name: 'org.mozilla.firefox', description: 'Firefox', version: '121.0', size: '67MB', installed: false },
];

export default function LinglongStore() {
  const [apps, setApps] = useState(LINGLONG_APPS);
  const [search, setSearch] = useState('');

  const filtered = apps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));

  const toggleInstall = (name: string) => {
    setApps(apps.map(a => a.name === name ? { ...a, installed: !a.installed } : a));
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-cyan-400" />
          <span className="font-bold text-lg">玲珑应用商店</span>
        </div>
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 glass-panel rounded-lg px-3 py-1.5">
            <Search size={14} className="text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索玲珑应用..." className="bg-transparent outline-none text-sm flex-1" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filtered.map(app => (
            <div key={app.name} className="glass-panel rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0, 180, 216, 0.15)' }}>
                <Package size={20} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-cyan-400">{app.name}</div>
                <div className="text-sm">{app.description}</div>
                <div className="text-xs text-muted-foreground">v{app.version} · {app.size}</div>
              </div>
              <button onClick={() => toggleInstall(app.name)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${app.installed ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'}`}>
                {app.installed ? <><Check size={14} /> 已安装</> : <><Download size={14} /> 安装</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
