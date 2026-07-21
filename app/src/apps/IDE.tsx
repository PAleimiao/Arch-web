import { useState } from 'react';
import { Boxes, FileCode } from 'lucide-react';

const IDES = [
  { name: 'IntelliJ IDEA', lang: 'Java/Kotlin', version: '2024.1', color: '#FE315D' },
  { name: 'PyCharm', lang: 'Python', version: '2024.1', color: '#21D789' },
  { name: 'WebStorm', lang: 'JavaScript', version: '2024.1', color: '#07C3F2' },
  { name: 'CLion', lang: 'C/C++', version: '2024.1', color:'#21D789' },
  { name: 'GoLand', lang: 'Go', version: '2024.1', color: '#0D7FE9' },
  { name: 'Rider', lang: '.NET', version: '2024.1', color: '#C40F5B' },
];

export default function IDE() {
  const [installed, setInstalled] = useState<Set<string>>(new Set(['IntelliJ IDEA', 'PyCharm']));

  const toggle = (name: string) => {
    const next = new Set(installed);
    if (next.has(name)) next.delete(name); else next.add(name);
    setInstalled(next);
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <Boxes size={18} className="text-purple-400" />
        <span className="font-bold">JetBrains Toolbox</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {IDES.map(ide => (
            <div key={ide.name} className="glass-panel rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ide.color}20` }}>
                <FileCode size={24} style={{ color: ide.color }} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{ide.name}</div>
                <div className="text-xs text-muted-foreground">{ide.lang} · v{ide.version}</div>
              </div>
              <button onClick={() => toggle(ide.name)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${installed.has(ide.name) ? 'bg-white/5 text-muted-foreground hover:bg-white/10' : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'}`}>
                {installed.has(ide.name) ? '已安装' : '安装'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
