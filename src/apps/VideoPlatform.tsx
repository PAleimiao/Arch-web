import { useState } from 'react';
import { Play } from 'lucide-react';

const VIDEOS = [
  { title: 'Arch Linux 安装全过程 | 2024最新教程', author: 'Linux达人', views: '12.5万', time: '25:34', thumbnail: 'A' },
  { title: 'Hyprland 配置美化指南', author: '桌面美化', views: '8.3万', time: '18:22', thumbnail: 'H' },
  { title: 'Neovim 从入门到精通', author: '代码之道', views: '23.1万', time: '42:15', thumbnail: 'N' },
  { title: 'Arch + Wayland 游戏体验实测', author: '游戏Linux', views: '5.6万', time: '15:48', thumbnail: 'G' },
  { title: '10个必装的 Arch AUR 软件', author: '软件推荐', views: '31.2万', time: '12:05', thumbnail: 'S' },
  { title: 'Linux 内核编译优化', author: '极客时间', views: '3.4万', time: '35:20', thumbnail: 'L' },
];

export default function VideoPlatform() {
  const [, setPlaying] = useState(false);
  void setPlaying;

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      {/* Categories */}
      <div className="flex gap-2 p-3 overflow-x-auto">
        {['推荐', '游戏', '科技', '音乐', '电影', '教程', '直播'].map(cat => (
          <button key={cat} className="px-3 py-1 rounded-full text-sm glass-panel hover:bg-white/10 transition-colors whitespace-nowrap">{cat}</button>
        ))}
      </div>

      {/* Featured */}
      <div className="px-3 mb-3">
        <div className="glass-panel rounded-xl p-4 flex items-center gap-4">
          <div className="w-32 h-20 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0, 180, 216, 0.2)' }}>
            <Play size={32} className="text-cyan-400" />
          </div>
          <div>
            <div className="font-medium">Arch Linux 安装全过程 | 2024最新教程</div>
            <div className="text-xs text-muted-foreground mt-1">Linux达人 · 12.5万观看 · 2天前</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 px-3 pb-3">
        {VIDEOS.map((v, i) => (
          <button key={i} className="glass-panel rounded-xl overflow-hidden hover:border-cyan-400/30 transition-all text-left">
            <div className="aspect-video flex items-center justify-center" style={{ background: `hsl(${i * 60}, 40%, 25%)` }}>
              <span className="text-3xl font-bold opacity-50">{v.thumbnail}</span>
            </div>
            <div className="p-2">
              <div className="text-sm font-medium truncate">{v.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{v.author} · {v.views}次观看</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
