import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, Film } from 'lucide-react';

const VIDEOS = [
  { title: 'Big Buck Bunny', duration: 600 },
  { title: 'Sintel', duration: 900 },
  { title: 'Tears of Steel', duration: 734 },
  { title: 'Arch Install Guide', duration: 1200 },
];

export default function VideoPlayer() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#000' }}>
      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center relative" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <div className="text-center">
          <Film size={64} className="text-muted-foreground mx-auto mb-4" />
          <div className="text-lg">{VIDEOS[current].title}</div>
          <div className="text-sm text-muted-foreground mt-1">{formatTime(VIDEOS[current].duration)}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-3" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
        <div className="w-full h-1 bg-white/10 rounded-full mb-3 cursor-pointer"
          onClick={(e) => setProgress((e.nativeEvent.offsetX / e.currentTarget.clientWidth) * VIDEOS[current].duration)}>
          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(progress / VIDEOS[current].duration) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrent(c => (c - 1 + VIDEOS.length) % VIDEOS.length)} className="hover:text-cyan-400"><SkipBack size={18} /></button>
            <button onClick={() => setPlaying(!playing)} className="hover:text-cyan-400">
              {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button onClick={() => setCurrent(c => (c + 1) % VIDEOS.length)} className="hover:text-cyan-400"><SkipForward size={18} /></button>
            <span className="text-xs text-muted-foreground ml-2">{formatTime(progress)} / {formatTime(VIDEOS[current].duration)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Volume2 size={16} className="text-muted-foreground" />
            <Maximize size={16} className="text-muted-foreground hover:text-cyan-400 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Playlist */}
      <div className="px-4 py-2 border-t border-white/5" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
        <div className="text-xs text-muted-foreground mb-2">播放列表</div>
        <div className="flex gap-2">
          {VIDEOS.map((v, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setProgress(0); }}
              className="flex-1 glass-panel rounded-lg p-2 text-left hover:border-cyan-400/30 transition-colors"
              style={{ border: i === current ? '1px solid rgba(0, 180, 216, 0.3)' : '1px solid transparent' }}
            >
              <div className="text-xs truncate">{v.title}</div>
              <div className="text-xs text-muted-foreground">{formatTime(v.duration)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
