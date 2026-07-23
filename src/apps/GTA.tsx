import { useState } from 'react';
import { ExternalLink, Maximize2, Minimize2, RotateCcw, Gamepad2 } from 'lucide-react';

const GTA_URLS = [
  { name: 'Mad Town Andreas', url: 'https://www.crazygames.com/game/mad-town-andreas-mafia-storie', desc: 'GTA风格开放世界网页游戏' },
  { name: 'Vice City Web', url: 'https://vc.web.app', desc: 'GTA Vice City WebAssembly版（需自备游戏文件解锁完整版）' },
  { name: 'Quenq Vice City', url: 'https://quenqvicecity.online/', desc: '免费在线Vice City，无需下载' },
  { name: 'GTA-VC ARM', url: 'https://gta-vc.armdev.cn/', desc: '网页版GTA Vice City' },
];

export default function GTA() {
  const [activeUrl, setActiveUrl] = useState(GTA_URLS[3].url);
  const [fullscreen, setFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">GTA 网页版</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeUrl}
            onChange={e => { setActiveUrl(e.target.value); setKey(k => k + 1); }}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-emerald-500/50"
          >
            {GTA_URLS.map(u => (
              <option key={u.url} value={u.url}>{u.name}</option>
            ))}
          </select>
          <button
            onClick={() => setKey(k => k + 1)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/60"
            title="刷新"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/60"
            title={fullscreen ? '退出全屏' : '全屏'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/60"
            title="在新标签页打开"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Description bar */}
      <div className="px-4 py-1.5 bg-white/[0.02] border-b border-white/5">
        <p className="text-[10px] text-white/40">
          {GTA_URLS.find(u => u.url === activeUrl)?.desc}
          {' '}· 如无法加载请尝试切换版本或点击右上角在新标签页打开
        </p>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative">
        <iframe
          key={key}
          src={activeUrl}
          className="w-full h-full border-0"
          allow="fullscreen; gamepad"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          title="GTA Web"
        />
      </div>
    </div>
  );
}
