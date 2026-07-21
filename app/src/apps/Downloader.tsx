import { useState, useRef, useCallback } from 'react';
import { Download, Plus, Trash2, Pause, Play, FileText, Image, Film, Music, Archive, File } from 'lucide-react';

interface DownloadTask {
  id: string;
  filename: string;
  url: string;
  progress: number;
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'error';
  size: string;
  speed: string;
  type: string;
}

const PRESET_TASKS: DownloadTask[] = [
  { id: '1', filename: 'archlinux-2026.07.01-x86_64.iso', url: 'https://archlinux.org/iso/2026.07.01/archlinux-2026.07.01-x86_64.iso', progress: 100, status: 'completed', size: '800 MB', speed: '0', type: 'iso' },
  { id: '2', filename: 'hyprland-v0.41.2.tar.gz', url: 'https://github.com/hyprwm/Hyprland/releases/download/v0.41.2/source.tar.gz', progress: 75, status: 'downloading', size: '12.5 MB', speed: '2.3 MB/s', type: 'archive' },
  { id: '3', filename: 'neofetch-7.3.1.tar.gz', url: 'https://github.com/dylanaraps/neofetch/archive/refs/tags/7.3.1.tar.gz', progress: 30, status: 'paused', size: '2.1 MB', speed: '0', type: 'archive' },
];

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return Image;
  if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext || '')) return Film;
  if (['mp3', 'flac', 'wav', 'ogg', 'm4a'].includes(ext || '')) return Music;
  if (['zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar'].includes(ext || '')) return Archive;
  if (['txt', 'md', 'json', 'xml', 'csv'].includes(ext || '')) return FileText;
  return File;
}

export default function Downloader() {
  const [tasks, setTasks] = useState<DownloadTask[]>(PRESET_TASKS);
  const [newUrl, setNewUrl] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const intervalRefs = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const simulateDownload = useCallback((id: string) => {
    // Clear existing interval
    const existing = intervalRefs.current.get(id);
    if (existing) clearInterval(existing);

    const interval = setInterval(() => {
      setTasks(prev => {
        const task = prev.find(t => t.id === id);
        if (!task || task.status !== 'downloading') {
          clearInterval(interval);
          return prev;
        }
        const newProgress = Math.min(task.progress + Math.random() * 3 + 0.5, 100);
        const newSpeed = `${(Math.random() * 5 + 0.5).toFixed(1)} MB/s`;
        if (newProgress >= 100) {
          clearInterval(interval);
          return prev.map(t => t.id === id ? { ...t, progress: 100, status: 'completed' as const, speed: '0' } : t);
        }
        return prev.map(t => t.id === id ? { ...t, progress: newProgress, speed: newSpeed } : t);
      });
    }, 500);

    intervalRefs.current.set(id, interval);
  }, []);

  const addTask = useCallback(() => {
    if (!newUrl.trim()) return;
    const filename = newUrl.split('/').pop() || 'unknown';
    const task: DownloadTask = {
      id: Date.now().toString(),
      filename,
      url: newUrl,
      progress: 0,
      status: 'downloading',
      size: '计算中...',
      speed: '0',
      type: 'file',
    };
    setTasks(prev => [task, ...prev]);
    setNewUrl('');
    setShowAdd(false);
    simulateDownload(task.id);
  }, [newUrl, simulateDownload]);

  const toggleStatus = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.status === 'downloading') {
        const interval = intervalRefs.current.get(id);
        if (interval) clearInterval(interval);
        return { ...t, status: 'paused' };
      }
      if (t.status === 'paused') {
        simulateDownload(id);
        return { ...t, status: 'downloading' };
      }
      return t;
    }));
  }, [simulateDownload]);

  const deleteTask = useCallback((id: string) => {
    const interval = intervalRefs.current.get(id);
    if (interval) clearInterval(interval);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'downloading': return 'text-cyan-400';
      case 'paused': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'downloading': return '下载中';
      case 'paused': return '已暂停';
      case 'error': return '出错';
      default: return '等待中';
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Download size={16} className="text-cyan-400" />
          <span className="text-sm font-medium">下载管理器</span>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition-colors">
          <Plus size={14} />
        </button>
      </div>

      {/* Add URL */}
      {showAdd && (
        <div className="p-3 border-b border-white/5 bg-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="输入下载链接..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-cyan-400/50"
              autoFocus
            />
            <button onClick={addTask} className="px-3 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30">添加</button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {tasks.map(task => {
          const Icon = getFileIcon(task.filename);
          return (
            <div key={task.id} className="glass-panel rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate">{task.filename}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className={getStatusColor(task.status)}>{getStatusText(task.status)}</span>
                    <span>{task.size}</span>
                    {task.status === 'downloading' && <span className="text-cyan-400">{task.speed}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {task.status !== 'completed' && (
                    <button onClick={() => toggleStatus(task.id)} className="p-1 rounded hover:bg-white/10 transition-colors">
                      {task.status === 'downloading' ? <Pause size={12} className="text-yellow-400" /> : <Play size={12} className="text-green-400" />}
                    </button>
                  )}
                  <button onClick={() => deleteTask(task.id)} className="p-1 rounded hover:bg-white/10 transition-colors">
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${task.progress}%`,
                    background: task.status === 'completed' ? '#10B981' : task.status === 'error' ? '#EF4444' : '#00B4D8',
                  }}
                />
              </div>
              <div className="text-[9px] text-muted-foreground mt-1 text-right">{task.progress.toFixed(0)}%</div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Download size={32} className="mb-2 opacity-30" />
            <div className="text-sm">暂无下载任务</div>
            <div className="text-xs mt-1">点击右上角 + 添加下载</div>
          </div>
        )}
      </div>
    </div>
  );
}
