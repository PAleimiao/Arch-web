import { useState } from 'react';
import { Camera, Monitor, Crop, RectangleHorizontal, Save, Copy } from 'lucide-react';

export default function Screenshot() {
  const [mode, setMode] = useState<'full' | 'window' | 'area'>('full');
  const [delay, setDelay] = useState(0);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="glass-panel rounded-2xl p-8 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-6">
          <Camera size={24} className="text-purple-400" />
          <div>
            <div className="font-bold text-lg">截图工具</div>
            <div className="text-xs text-muted-foreground">Flameshot</div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {[
            { id: 'full', label: '全屏截图', icon: Monitor },
            { id: 'window', label: '窗口截图', icon: RectangleHorizontal },
            { id: 'area', label: '区域截图', icon: Crop },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id as 'full' | 'window' | 'area')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left"
              style={{ background: mode === m.id ? 'rgba(0, 180, 216, 0.15)' : 'rgba(255,255,255,0.03)' }}>
              <m.icon size={18} className={mode === m.id ? 'text-cyan-400' : 'text-muted-foreground'} />
              <span className={mode === m.id ? 'text-cyan-400' : ''}>{m.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="text-xs text-muted-foreground mb-2 block">延迟</label>
          <div className="flex gap-2">
            {[0, 3, 5, 10].map(d => (
              <button key={d} onClick={() => setDelay(d)}
                className="flex-1 py-2 rounded-lg text-sm transition-colors"
                style={{ background: delay === d ? 'rgba(0, 180, 216, 0.15)' : 'rgba(255,255,255,0.03)', color: delay === d ? '#00B4D8' : '#979DAC' }}>
                {d === 0 ? '无' : `${d}s`}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full py-3 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors font-medium">
          开始截图
        </button>

        <div className="flex gap-2 mt-3">
          <button className="flex-1 py-2 rounded-lg glass-panel hover:bg-white/5 flex items-center justify-center gap-1.5 text-sm">
            <Save size={14} /> 保存路径
          </button>
          <button className="flex-1 py-2 rounded-lg glass-panel hover:bg-white/5 flex items-center justify-center gap-1.5 text-sm">
            <Copy size={14} /> 复制到剪贴板
          </button>
        </div>
      </div>
    </div>
  );
}
