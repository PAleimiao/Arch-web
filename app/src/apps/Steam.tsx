import { useState } from 'react';
import { Gamepad2, Star, Clock, Users } from 'lucide-react';

const GAMES = [
  { name: 'Cyberpunk 2077', playtime: '45h', rating: 4.5, installed: true, size: '70GB' },
  { name: 'Elden Ring', playtime: '120h', rating: 4.9, installed: true, size: '50GB' },
  { name: 'Hades', playtime: '35h', rating: 4.8, installed: true, size: '15GB' },
  { name: 'Hollow Knight', playtime: '60h', rating: 4.9, installed: true, size: '8GB' },
  { name: 'Stardew Valley', playtime: '80h', rating: 4.7, installed: true, size: '500MB' },
  { name: 'Baldur\'s Gate 3', playtime: '0h', rating: 4.9, installed: false, size: '122GB' },
  { name: 'Dota 2', playtime: '200h', rating: 4.3, installed: true, size: '40GB' },
  { name: 'CS2', playtime: '150h', rating: 4.2, installed: true, size: '30GB' },
];

export default function Steam() {
  const [tab, setTab] = useState('library');

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1B2838' }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5" style={{ background: '#171D25' }}>
        <div className="flex items-center gap-2">
          <Gamepad2 size={20} className="text-blue-400" />
          <span className="font-bold">Steam</span>
        </div>
        <div className="flex gap-1">
          {[{ id: 'store', label: '商店' }, { id: 'library', label: '库' }, { id: 'community', label: '社区' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded text-sm transition-colors"
              style={{ background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'library' && (
          <div className="space-y-2">
            {GAMES.map(game => (
              <div key={game.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-24 h-14 rounded flex items-center justify-center" style={{ background: `hsl(${game.name.charCodeAt(0) * 20}, 40%, 25%)` }}>
                  <Gamepad2 size={20} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{game.name}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Clock size={10} /> {game.playtime}</span>
                    <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" /> {game.rating}</span>
                    <span>{game.size}</span>
                  </div>
                </div>
                <button className={`px-4 py-2 rounded text-sm ${game.installed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {game.installed ? '开始游戏' : '安装'}
                </button>
              </div>
            ))}
          </div>
        )}
        {tab === 'store' && (
          <div className="text-center py-12 text-muted-foreground">
            <Gamepad2 size={48} className="mx-auto mb-4" />
            <div className="text-lg font-medium">Steam 商店</div>
            <div className="text-sm mt-1">探索和购买新游戏</div>
          </div>
        )}
        {tab === 'community' && (
          <div className="text-center py-12 text-muted-foreground">
            <Users size={48} className="mx-auto mb-4" />
            <div className="text-lg font-medium">Steam 社区</div>
            <div className="text-sm mt-1">与玩家交流和分享</div>
          </div>
        )}
      </div>
    </div>
  );
}
