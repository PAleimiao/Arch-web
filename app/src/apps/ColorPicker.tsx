import { useState, useRef, useCallback, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

const PRESET_COLORS = [
  '#EF233C', '#FF7139', '#F4D03F', '#2DC653', '#00B4D8', '#007ACC',
  '#7B2CBF', '#EC4899', '#8B5CF6', '#14B8A6', '#F59E0B', '#EEF4ED',
  '#1a1a2e', '#16213e', '#0f3460', '#533483', '#f39422', '#e94560',
];

export default function ColorPicker() {
  const [hue, setHue] = useState(180);
  const [sat, setSat] = useState(80);
  const [light, setLight] = useState(50);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const color = hslToHex(hue, sat, light);

  const copyColor = () => {
    navigator.clipboard?.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Draw gradient canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const s = (x / w) * 100;
        const l = (1 - y / h) * 100;
        ctx.fillStyle = `hsl(${hue}, ${s}%, ${l}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setSat(Math.round(x * 100));
    setLight(Math.round((1 - y) * 100));
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-4" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      {/* Preview */}
      <div className="rounded-xl h-20 mb-3 flex items-center justify-center relative overflow-hidden"
        style={{ background: color, boxShadow: `0 0 20px ${color}40` }}>
        <button onClick={copyColor} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 hover:bg-black/50 transition-colors">
          {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          <span className="font-mono font-bold">{color}</span>
        </button>
      </div>

      {/* Canvas gradient */}
      <canvas
        ref={canvasRef}
        width={200}
        height={100}
        onClick={handleCanvasClick}
        className="w-full h-24 rounded-lg cursor-crosshair mb-3"
      />

      {/* Hue slider */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground mb-1 block">色相 (H)</label>
        <input type="range" min="0" max="360" value={hue} onChange={e => setHue(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer"
          style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }} />
      </div>

      {/* Saturation */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground mb-1 block">饱和度 (S): {sat}%</label>
        <input type="range" min="0" max="100" value={sat} onChange={e => setSat(Number(e.target.value))}
          className="w-full accent-cyan-400" />
      </div>

      {/* Lightness */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground mb-1 block">亮度 (L): {light}%</label>
        <input type="range" min="0" max="100" value={light} onChange={e => setLight(Number(e.target.value))}
          className="w-full accent-cyan-400" />
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(c => (
          <button key={c} onClick={() => { /* Could convert hex to HSL */ }}
            className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform"
            style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}
