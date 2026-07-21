import { useState, useCallback, useEffect } from 'react';
import { Trash2, HardDrive, Zap, Clock, AlertTriangle, Check, Loader2, RefreshCw } from 'lucide-react';

interface CleanItem {
  id: string;
  name: string;
  description: string;
  size: string;
  scanning: boolean;
  selected: boolean;
  cleaned: boolean;
  icon: any;
}

const INITIAL_ITEMS: CleanItem[] = [
  { id: '1', name: '系统缓存', description: '/var/cache/pacman/pkg', size: '245 MB', scanning: false, selected: true, cleaned: false, icon: HardDrive },
  { id: '2', name: '临时文件', description: '/tmp', size: '128 MB', scanning: false, selected: true, cleaned: false, icon: Clock },
  { id: '3', name: '浏览器缓存', description: '~/.cache/chromium', size: '89 MB', scanning: false, selected: true, cleaned: false, icon: Zap },
  { id: '4', name: '缩略图缓存', description: '~/.cache/thumbnails', size: '34 MB', scanning: false, selected: true, cleaned: false, icon: HardDrive },
  { id: '5', name: '日志文件', description: '/var/log/journal', size: '156 MB', scanning: false, selected: false, cleaned: false, icon: Clock },
  { id: '6', name: '旧内核', description: '/boot', size: '312 MB', scanning: false, selected: false, cleaned: false, icon: HardDrive },
  { id: '7', name: 'AUR 构建缓存', description: '~/.cache/aur', size: '67 MB', scanning: false, selected: true, cleaned: false, icon: Zap },
];

export default function Cleaner() {
  const [items, setItems] = useState<CleanItem[]>(INITIAL_ITEMS);
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'scan-done' | 'cleaning' | 'done'>('idle');
  const [totalSaved, setTotalSaved] = useState('0 MB');

  const startScan = useCallback(() => {
    setPhase('scanning');
    // Simulate scan one by one
    items.forEach((item, index) => {
      setTimeout(() => {
        setItems(prev => prev.map(it => it.id === item.id ? { ...it, scanning: true } : it));
        setTimeout(() => {
          setItems(prev => prev.map(it => it.id === item.id ? { ...it, scanning: false } : it));
        }, 400);
      }, index * 300);
    });

    setTimeout(() => {
      setPhase('scan-done');
    }, items.length * 300 + 500);
  }, [items]);

  const startClean = useCallback(() => {
    setPhase('cleaning');
    const selected = items.filter(it => it.selected);

    selected.forEach((item, index) => {
      setTimeout(() => {
        setItems(prev => prev.map(it => it.id === item.id ? { ...it, scanning: true } : it));
        setTimeout(() => {
          setItems(prev => prev.map(it => it.id === item.id ? { ...it, scanning: false, cleaned: true, size: '0 MB' } : it));
        }, 400);
      }, index * 400);
    });

    setTimeout(() => {
      setPhase('done');
      // Calculate total saved
      const total = selected.reduce((acc, it) => {
        const num = parseFloat(it.size);
        return acc + num;
      }, 0);
      setTotalSaved(`${total.toFixed(0)} MB`);
    }, selected.length * 400 + 500);
  }, [items]);

  const reset = useCallback(() => {
    setItems(INITIAL_ITEMS);
    setPhase('idle');
    setTotalSaved('0 MB');
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, selected: !it.selected } : it));
  }, []);

  const selectedTotal = items.filter(it => it.selected && !it.cleaned).reduce((acc, it) => acc + parseFloat(it.size), 0);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-green-400" />
          <span className="text-sm font-medium">系统清理</span>
        </div>
        {phase === 'done' && (
          <button onClick={reset} className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {/* Status */}
        {phase === 'idle' && (
          <div className="glass-panel rounded-xl p-6 text-center">
            <HardDrive size={32} className="text-cyan-400 mx-auto mb-2" />
            <div className="text-sm font-medium">系统清理工具</div>
            <div className="text-xs text-muted-foreground mt-1">扫描并清理系统垃圾文件</div>
            <button onClick={startScan} className="mt-3 px-4 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors">
              开始扫描
            </button>
          </div>
        )}

        {phase === 'scanning' && (
          <div className="glass-panel rounded-xl p-6 text-center">
            <Loader2 size={32} className="text-cyan-400 mx-auto mb-2 animate-spin" />
            <div className="text-sm">正在扫描系统...</div>
            <div className="text-xs text-muted-foreground mt-1">检查缓存、临时文件和日志</div>
          </div>
        )}

        {phase === 'done' && (
          <div className="glass-panel rounded-xl p-6 text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Check size={32} className="text-green-400 mx-auto mb-2" />
            <div className="text-sm font-medium">清理完成！</div>
            <div className="text-lg font-bold text-green-400 mt-1">释放了 {totalSaved} 空间</div>
            <button onClick={reset} className="mt-3 px-4 py-2 rounded-lg bg-green-400/20 text-green-400 text-xs hover:bg-green-400/30 transition-colors">
              再次扫描
            </button>
          </div>
        )}

        {/* Items list */}
        {(phase === 'scan-done' || phase === 'cleaning' || phase === 'done') && (
          <>
            {items.map(item => (
              <div key={item.id}
                className={`glass-panel rounded-lg p-3 flex items-center gap-3 transition-all ${item.cleaned ? 'opacity-40' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleSelect(item.id)}
                  disabled={item.cleaned || phase === 'cleaning'}
                  className="accent-cyan-400"
                />
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {item.scanning ? <Loader2 size={14} className="animate-spin text-cyan-400" /> : <item.icon size={14} className="text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground">{item.description}</div>
                </div>
                <div className={`text-xs font-mono ${item.cleaned ? 'text-green-400 line-through' : ''}`}>
                  {item.size}
                </div>
              </div>
            ))}

            {phase === 'scan-done' && (
              <div className="glass-panel rounded-xl p-4 flex items-center justify-between" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  <div>
                    <div className="text-xs font-medium">可清理: {selectedTotal.toFixed(0)} MB</div>
                    <div className="text-[10px] text-muted-foreground">已选择 {items.filter(it => it.selected).length} 项</div>
                  </div>
                </div>
                <button onClick={startClean} className="px-4 py-2 rounded-lg bg-yellow-400/20 text-yellow-400 text-xs hover:bg-yellow-400/30 transition-colors">
                  开始清理
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
