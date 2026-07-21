import { useState, useCallback } from 'react';
import { HardDrive, Folder, FileText, Image, Film, Music, Archive, File, Upload, Download, Trash2, Plus } from 'lucide-react';

interface CloudFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  modified: string;
  fileType?: string;
  children?: CloudFile[];
}

const INITIAL_FILES: CloudFile[] = [
    { id: '1', name: '文档', type: 'folder', size: '-', modified: '2026-07-01', children: [
      { id: '1-1', name: '项目计划.md', type: 'file', size: '12 KB', modified: '2026-07-01', fileType: 'text' },
      { id: '1-2', name: '会议记录.txt', type: 'file', size: '5 KB', modified: '2026-06-28', fileType: 'text' },
      { id: '1-3', name: '预算表.xlsx', type: 'file', size: '34 KB', modified: '2026-06-25', fileType: 'archive' },
    ]},
    { id: '2', name: '图片', type: 'folder', size: '-', modified: '2026-07-05', children: [
      { id: '2-1', name: '壁纸.png', type: 'file', size: '2.3 MB', modified: '2026-07-05', fileType: 'image' },
      { id: '2-2', name: '截图.jpg', type: 'file', size: '456 KB', modified: '2026-07-03', fileType: 'image' },
      { id: '2-3', name: '头像.svg', type: 'file', size: '12 KB', modified: '2026-06-20', fileType: 'image' },
    ]},
    { id: '3', name: '视频', type: 'folder', size: '-', modified: '2026-06-15', children: [
      { id: '3-1', name: '教程.mp4', type: 'file', size: '156 MB', modified: '2026-06-15', fileType: 'video' },
    ]},
    { id: '4', name: '音乐', type: 'folder', size: '-', modified: '2026-05-20', children: [
      { id: '4-1', name: '播放列表.flac', type: 'file', size: '234 MB', modified: '2026-05-20', fileType: 'music' },
    ]},
    { id: '5', name: 'arch-install.sh', type: 'file', size: '3 KB', modified: '2026-07-08', fileType: 'text' },
    { id: '6', name: 'backup.tar.gz', type: 'file', size: '1.2 GB', modified: '2026-07-01', fileType: 'archive' },
  ];

function getFileIcon(type?: string) {
  switch (type) {
    case 'image': return Image;
    case 'video': return Film;
    case 'music': return Music;
    case 'archive': return Archive;
    case 'text': return FileText;
    default: return File;
  }
}

function calculateTotalSize(files: CloudFile[]): number {
  let total = 0;
  for (const f of files) {
    if (f.type === 'folder' && f.children) {
      total += calculateTotalSize(f.children);
    } else if (f.size !== '-') {
      const num = parseFloat(f.size);
      if (f.size.includes('GB')) total += num * 1024;
      else if (f.size.includes('MB')) total += num;
      else if (f.size.includes('KB')) total += num / 1024;
    }
  }
  return total;
}

export default function CloudStorage() {
  const [files, setFiles] = useState<CloudFile[]>(INITIAL_FILES);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1', '2']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>(['我的云盘']);

  const totalSize = calculateTotalSize(files);
  const totalCapacity = 5120; // 5GB in MB
  const usedPercent = (totalSize / totalCapacity) * 100;

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const deleteFile = useCallback((id: string) => {
    const removeFromTree = (items: CloudFile[]): CloudFile[] => {
      return items.filter(item => {
        if (item.id === id) return false;
        if (item.children) item.children = removeFromTree(item.children);
        return true;
      });
    };
    setFiles(prev => removeFromTree(prev));
    setSelectedFile(null);
  }, []);

  const renderFileTree = (items: CloudFile[], depth: number = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <button
          onClick={() => item.type === 'folder' ? toggleFolder(item.id) : setSelectedFile(item.id)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 transition-colors text-left ${selectedFile === item.id ? 'bg-white/10' : ''}`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {item.type === 'folder' ? (
            <Folder size={14} className="text-yellow-400 flex-shrink-0" />
          ) : (
            (() => { const Icon = getFileIcon(item.fileType); return <Icon size={14} className="text-cyan-400 flex-shrink-0" />; })()
          )}
          <span className="text-xs truncate flex-1">{item.name}</span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.size}</span>
        </button>
        {item.type === 'folder' && expandedFolders.has(item.id) && item.children && (
          <div>{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const selectedFileData = (() => {
    const find = (items: CloudFile[]): CloudFile | null => {
      for (const item of items) {
        if (item.id === selectedFile) return item;
        if (item.children) { const found = find(item.children); if (found) return found; }
      }
      return null;
    };
    return find(files);
  })();

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-cyan-400" />
          <span className="text-sm font-medium">云存储</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="上传"><Upload size={14} /></button>
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="新建文件夹"><Plus size={14} /></button>
        </div>
      </div>

      {/* Storage bar */}
      <div className="px-4 py-2 border-b border-white/5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>已用 {totalSize.toFixed(1)} MB / {totalCapacity / 1024} GB</span>
          <span>{usedPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${Math.min(usedPercent, 100)}%` }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* File tree */}
        <div className="w-56 overflow-y-auto border-r border-white/5 flex-shrink-0">
          <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-b border-white/5">{path.join(' / ')}</div>
          {renderFileTree(files)}
        </div>

        {/* File detail / preview */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedFileData ? (
            <div className="glass-panel rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  {selectedFileData.type === 'folder' ? (
                    <Folder size={24} className="text-yellow-400" />
                  ) : (
                    (() => { const Icon = getFileIcon(selectedFileData.fileType); return <Icon size={24} className="text-cyan-400" />; })()
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">{selectedFileData.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedFileData.size} · 修改于 {selectedFileData.modified}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors flex items-center gap-1">
                  <Download size={12} /> 下载
                </button>
                <button onClick={() => deleteFile(selectedFileData.id)} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors flex items-center gap-1">
                  <Trash2 size={12} /> 删除
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <HardDrive size={32} className="mb-2 opacity-30" />
              <div className="text-sm">选择一个文件查看详情</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
