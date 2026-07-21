import { useState } from 'react';
import { Box, Move, RotateCcw, Maximize, Grid3X3, Sun } from 'lucide-react';

export default function Blender() {
  const [mode, setMode] = useState<'layout' | 'modeling' | 'sculpting'>('layout');

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1A1A1A' }}>
      {/* Top Bar */}
      <div className="flex items-center gap-1 px-2 py-1" style={{ background: '#2B2B2B' }}>
        <Box size={16} className="text-orange-400 mr-2" />
        {['文件', '编辑', '渲染', '窗口', '帮助'].map(m => (
          <button key={m} className="px-2 py-0.5 rounded text-xs hover:bg-white/10">{m}</button>
        ))}
        <div className="ml-auto flex gap-1">
          {(['layout', 'modeling', 'sculpting'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`px-2 py-0.5 rounded text-xs ${mode === m ? 'bg-orange-400/20 text-orange-400' : 'hover:bg-white/10'}`}>
              {m === 'layout' ? '布局' : m === 'modeling' ? '建模' : '雕刻'}
            </button>
          ))}
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-10 flex flex-col items-center gap-1 py-2 border-r border-white/5">
          <button className="p-1.5 rounded hover:bg-white/10"><Move size={14} /></button>
          <button className="p-1.5 rounded hover:bg-white/10"><RotateCcw size={14} /></button>
          <button className="p-1.5 rounded hover:bg-white/10"><Maximize size={14} /></button>
          <button className="p-1.5 rounded hover:bg-white/10"><Grid3X3 size={14} /></button>
          <button className="p-1.5 rounded hover:bg-white/10"><Sun size={14} /></button>
        </div>

        {/* 3D View */}
        <div className="flex-1 relative" style={{ background: 'linear-gradient(135deg, #2B2B2B 0%, #1A1A1A 100%)' }}>
          {/* Grid */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 relative" style={{ transform: 'perspective(600px) rotateX(60deg)' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={`h${i}`} className="absolute w-full h-px" style={{ top: `${i * 11.1}%`, background: 'rgba(255,255,255,0.1)' }} />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <div key={`v${i}`} className="absolute h-full w-px" style={{ left: `${i * 11.1}%`, background: 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          </div>

          {/* Cube */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 relative" style={{ transform: 'rotateX(-20deg) rotateY(30deg)', transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 border border-orange-400/40" style={{ background: 'rgba(232, 125, 13, 0.1)', transform: 'translateZ(32px)' }} />
              <div className="absolute inset-0 border border-orange-400/40" style={{ background: 'rgba(232, 125, 13, 0.15)', transform: 'rotateY(90deg) translateZ(32px)' }} />
              <div className="absolute inset-0 border border-orange-400/40" style={{ background: 'rgba(232, 125, 13, 0.2)', transform: 'rotateY(180deg) translateZ(32px)' }} />
              <div className="absolute inset-0 border border-orange-400/40" style={{ background: 'rgba(232, 125, 13, 0.15)', transform: 'rotateY(-90deg) translateZ(32px)' }} />
              <div className="absolute inset-0 border border-orange-400/40" style={{ background: 'rgba(232, 125, 13, 0.25)', transform: 'rotateX(90deg) translateZ(32px)' }} />
              <div className="absolute inset-0 border border-orange-400/40" style={{ background: 'rgba(232, 125, 13, 0.1)', transform: 'rotateX(-90deg) translateZ(32px)' }} />
            </div>
          </div>

          {/* Info */}
          <div className="absolute top-2 left-12 text-xs font-mono text-muted-foreground">
            <div>用户视角</div>
            <div>Verts: 8 | Edges: 12 | Faces: 6</div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-48 border-l border-white/5 p-2">
          <div className="text-xs text-muted-foreground mb-2">场景</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5">
              <Box size={10} /> Cube
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded">
              <Sun size={10} /> Light
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded">
              <Grid3X3 size={10} /> Camera
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
