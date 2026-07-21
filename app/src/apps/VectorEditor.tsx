import { useState } from 'react';
import { PenTool, MousePointer, Circle, Square, Type, Layers } from 'lucide-react';

const TOOLS = [
  { icon: MousePointer, name: '选择' },
  { icon: PenTool, name: '钢笔' },
  { icon: Circle, name: '圆形' },
  { icon: Square, name: '矩形' },
  { icon: Type, name: '文字' },
];

export default function VectorEditor() {
  const [activeTool, setActiveTool] = useState(0);
  const [objects] = useState([
    { type: 'rect', x: 100, y: 80, w: 120, h: 80, fill: '#00B4D830', stroke: '#00B4D8' },
    { type: 'circle', x: 300, y: 150, r: 50, fill: '#7B2CBF30', stroke: '#7B2CBF' },
    { type: 'rect', x: 200, y: 200, w: 160, h: 60, fill: '#2DC65330', stroke: '#2DC653' },
    { type: 'circle', x: 150, y: 280, r: 35, fill: '#EF233C30', stroke: '#EF233C' },
    { type: 'rect', x: 350, y: 100, w: 80, h: 120, fill: '#FF713930', stroke: '#FF7139' },
  ]);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#2D2D2D' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-white/5">
        {TOOLS.map((tool, i) => (
          <button key={i} onClick={() => setActiveTool(i)}
            className={`p-2 rounded transition-colors ${activeTool === i ? 'bg-white/10' : 'hover:bg-white/5'}`}
            title={tool.name}>
            <tool.icon size={16} />
          </button>
        ))}
        <div className="h-4 w-px bg-white/10 mx-1" />
        {['#EF233C', '#F4D03F', '#2DC653', '#00B4D8', '#7B2CBF', '#EEF4ED'].map(c => (
          <button key={c} className="w-4 h-4 rounded-full border border-white/20" style={{ background: c }} />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative overflow-auto" style={{ background: '#F0F0F0' }}>
          <svg className="absolute" style={{ width: 800, height: 600 }}>
            {/* Grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#CCCCCC" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Objects */}
            {objects.map((obj, i) => (
              obj.type === 'rect' ? (
                <rect key={i} x={obj.x} y={obj.y} width={obj.w} height={obj.h}
                  fill={obj.fill} stroke={obj.stroke} strokeWidth="2" rx="2"
                  className="hover:stroke-width-3 cursor-pointer" />
              ) : (
                <circle key={i} cx={obj.x} cy={obj.y} r={obj.r}
                  fill={obj.fill} stroke={obj.stroke} strokeWidth="2"
                  className="cursor-pointer" />
              )
            ))}
          </svg>
        </div>

        {/* Properties */}
        <div className="w-44 border-l border-white/5 p-3">
          <div className="text-xs text-muted-foreground mb-2">属性</div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">X</label>
              <input type="number" defaultValue={100} className="w-full glass-panel rounded px-2 py-1 text-xs outline-none mt-0.5" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Y</label>
              <input type="number" defaultValue={80} className="w-full glass-panel rounded px-2 py-1 text-xs outline-none mt-0.5" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">宽度</label>
              <input type="number" defaultValue={120} className="w-full glass-panel rounded px-2 py-1 text-xs outline-none mt-0.5" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">高度</label>
              <input type="number" defaultValue={80} className="w-full glass-panel rounded px-2 py-1 text-xs outline-none mt-0.5" />
            </div>
          </div>

          <div className="text-xs text-muted-foreground mb-2 mt-4">图层</div>
          <div className="space-y-1">
            {objects.map((obj, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-white/5 cursor-pointer">
                <Layers size={10} />
                <span>{obj.type === 'rect' ? '矩形' : '圆形'} {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
