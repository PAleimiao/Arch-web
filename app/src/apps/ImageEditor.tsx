import { useState, useRef, useEffect } from 'react';
import { Palette, Undo, Download } from 'lucide-react';

export default function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#00B4D8');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0D1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDraw = (e: React.MouseEvent) => {
    setDrawing(true);
    draw(e);
  };
  const stopDraw = () => setDrawing(false);
  const draw = (e: React.MouseEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#0D1117' : color;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <button onClick={() => setTool('brush')} className={`p-1.5 rounded ${tool === 'brush' ? 'bg-cyan-400/20' : 'hover:bg-white/10'}`}><Palette size={14} /></button>
        <button onClick={() => setTool('eraser')} className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-cyan-400/20' : 'hover:bg-white/10'}`}><Undo size={14} /></button>
        <div className="h-4 w-px bg-white/10" />
        {['#EF233C', '#F4D03F', '#2DC653', '#00B4D8', '#7B2CBF', '#EEF4ED'].map(c => (
          <button key={c} onClick={() => { setColor(c); setTool('brush'); }} className="w-5 h-5 rounded-full border border-white/20" style={{ background: c }} />
        ))}
        <div className="h-4 w-px bg-white/10" />
        <input type="range" min="1" max="20" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-20 accent-cyan-400" />
        <div className="flex-1" />
        <button className="p-1.5 rounded hover:bg-white/10"><Download size={14} /></button>
      </div>
      <div className="flex-1 flex items-center justify-center p-3 overflow-auto">
        <canvas
          ref={canvasRef}
          width={700}
          height={450}
          className="rounded-lg cursor-crosshair"
          style={{ background: '#0D1117', maxWidth: '100%' }}
          onMouseDown={startDraw}
          onMouseUp={stopDraw}
          onMouseOut={stopDraw}
          onMouseMove={draw}
        />
      </div>
    </div>
  );
}
