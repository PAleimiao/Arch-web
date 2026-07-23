import { useState } from 'react';
import { Gamepad2, ExternalLink, Star, Clock, Users, Trophy, Zap, Monitor, Download, Globe } from 'lucide-react';

interface SteamProps {
  onOpenApp?: (appId: string) => void;
}

export default function Steam({ onOpenApp }: SteamProps) {
  const [activeTab, setActiveTab] = useState('library');

  const gtaGame = {
    id: 'gta',
    title: 'GTA 网页版',
    subtitle: 'Grand Theft Auto',
    genre: '开放世界 / 动作',
    rating: 9.8,
    players: '单人 / 在线',
    hours: '∞',
    size: '0 MB',
    desc: '无需下载，浏览器直接开玩的 GTA 网页版合集。包含 GTA 风格开放世界、Vice City WebAssembly 版等多个在线版本。',
    tags: ['开放世界', '动作', '驾驶', '射击', '网页游戏'],
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Grand_Theft_Auto_logo.svg/1200px-Grand_Theft_Auto_logo.svg.png',
  };

  const handlePlayGTA = () => {
    if (onOpenApp) {
      onOpenApp('gta');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">游戏中心</span>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          {[
            { id: 'library', label: '库', icon: Monitor },
            { id: 'store', label: '商店', icon: Globe },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'library' && (
          <div className="space-y-4">
            {/* GTA Hero Card */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900/30 to-black border border-white/5">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80')] bg-cover bg-center opacity-20" />
              <div className="relative p-6 flex gap-6">
                <div className="w-32 h-44 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  <Gamepad2 className="w-12 h-12 text-emerald-400/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">已安装</span>
                    <span className="text-[10px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">网页版</span>
                  </div>
                  <h2 className="text-xl font-bold mb-1">{gtaGame.title}</h2>
                  <p className="text-xs text-white/50 mb-3">{gtaGame.subtitle} · {gtaGame.genre}</p>
                  <p className="text-sm text-white/70 mb-4 line-clamp-2">{gtaGame.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {gtaGame.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-white/5 text-white/50 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {gtaGame.rating}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {gtaGame.players}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {gtaGame.hours}h</span>
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {gtaGame.size}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePlayGTA}
                      className="px-5 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" /> 开始游戏
                    </button>
                    <button
                      onClick={() => window.open('https://www.crazygames.com/game/mad-town-andreas-mafia-storie', '_blank')}
                      className="px-4 py-2 bg-white/5 text-white/60 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> 新标签页打开
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
                <div className="text-lg font-bold">0 MB</div>
                <div className="text-[10px] text-white/40">无需下载</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Globe className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-lg font-bold">浏览器</div>
                <div className="text-[10px] text-white/40">即开即玩</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Monitor className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-lg font-bold">多版本</div>
                <div className="text-[10px] text-white/40">可切换</div>
              </div>
            </div>

            {/* Notice */}
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
              <p className="text-xs text-yellow-200/60">
                (｀・ω・´) 提示：网页版GTA由第三方网站提供，本应用仅作嵌入展示。如遇到加载问题，请尝试切换版本或在新标签页打开。
              </p>
            </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="flex flex-col items-center justify-center h-64 text-white/30">
            <Globe className="w-12 h-12 mb-3" />
            <p className="text-sm">商店功能暂未开放</p>
            <p className="text-xs mt-1">请直接在库中开始游戏</p>
          </div>
        )}
      </div>
    </div>
  );
}
