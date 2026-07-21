import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Scissors, SkipBack, SkipForward, Film } from 'lucide-react';

const CLIPS = [
  { name: 'Clip 1', duration: 15, color: '#00B4D8' },
  { name: 'Clip 2', duration: 10, color: '#7B2CBF' },
  { name: 'Clip 3', duration: 20, color: '#2DC653' },
  { name: 'Clip 4', duration: 8, color: '#FF7139' },
  { name: 'Transition', duration: 2, color: '#5C677D' },
  { name: 'Clip 5', duration: 12, color: '#EF233C' },
];

export default function VideoEditor() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalDuration = CLIPS.reduce((s, c) => s + c.duration, 0);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= totalDuration) { setPlaying(false); return 0; }
          return p + 0.1;
        });
      }, 100);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, totalDuration]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Preview */}
      <div className="flex-1 flex items-center justify-center relative" style={{ background: '#0A0A0A' }}>
        <Film size={64} className="text-muted-foreground" />
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">{formatTime(progress)} / {formatTime(totalDuration)}</div>
      </div>

      {/* Timeline */}
      <div className="h-32 border-t border-white/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setPlaying(!playing)} className="p-1.5 rounded hover:bg-white/10">
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button className="p-1.5 rounded hover:bg-white/10"><SkipBack size={14} /></button>
          <button className="p-1.5 rounded hover:bg-white/10"><SkipForward size={14} /></button>
          <button className="p-1.5 rounded hover:bg-white/10"><Scissors size={14} /></button>
        </div>
        <div className="flex items-center gap-1 h-16 rounded-lg overflow-hidden" style={{ background: 'rgba(0,18,51,0.5)' }}>
          {CLIPS.map((clip, i) => (
            <div key={i} className="h-full flex flex-col justify-center px-2 text-xs text-white cursor-pointer hover:brightness-110 transition-all"
              style={{ width: `${(clip.duration / totalDuration) * 100}%`, background: clip.color + '40', borderLeft: `2px solid ${clip.color}` }}>
              <span className="truncate">{clip.name}</span>
              <span className="text-xs opacity-60">{clip.duration}s</span>
            </div>
          ))}
        </div>
        {/* Playhead */}
        <div className="relative h-4">
          <div className="absolute top-0 w-0.5 h-full bg-red-500" style={{ left: `${(progress / totalDuration) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
