import { useState } from 'react';
import { Play, Pause, Mic, Scissors, Download, Volume2 } from 'lucide-react';

export default function AudioEditor() {
  const [playing, setPlaying] = useState(false);
  const [tracks] = useState([
    { name: '人声', color: '#00B4D8' },
    { name: '伴奏', color: '#7B2CBF' },
    { name: '音效', color: '#2DC653' },
  ]);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5">
        <button onClick={() => setPlaying(!playing)} className="p-2 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30">
          {playing ? <Pause size={16} className="text-cyan-400" /> : <Play size={16} className="text-cyan-400 ml-0.5" />}
        </button>
        <button className="p-1.5 rounded hover:bg-white/10"><Mic size={14} /></button>
        <button className="p-1.5 rounded hover:bg-white/10"><Scissors size={14} /></button>
        <button className="p-1.5 rounded hover:bg-white/10"><Download size={14} /></button>
        <div className="flex items-center gap-1 ml-auto"><Volume2 size={14} className="text-muted-foreground" /><input type="range" className="w-20 accent-cyan-400" /></div>
      </div>

      {/* Tracks */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tracks.map((track, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-20 text-xs text-right pr-2">{track.name}</div>
            <div className="flex-1 h-12 rounded-lg relative overflow-hidden" style={{ background: 'rgba(0,18,51,0.5)' }}>
              {/* Waveform */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                {Array.from({ length: 80 }, (_, j) => (
                  <rect key={j} x={`${j * 1.25}%`} y={`${50 - Math.random() * 40}%`} width="0.8%" height={`${Math.random() * 80}%`} fill={track.color} opacity="0.6" rx="1" />
                ))}
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="h-8 border-t border-white/5 flex items-center px-4 text-xs text-muted-foreground">
        00:00:00 / 00:03:45
      </div>
    </div>
  );
}
