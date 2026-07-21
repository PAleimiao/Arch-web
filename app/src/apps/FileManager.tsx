import { useState } from 'react';
import { Folder, FileText, Image, Music, Film, ChevronRight, Home, ArrowUp } from 'lucide-react';

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  icon: string;
}

const FILE_DATA: Record<string, FileItem[]> = {
  '~': [
    { name: 'Desktop', type: 'folder', modified: '2026-07-01', icon: 'folder' },
    { name: 'Documents', type: 'folder', modified: '2026-06-28', icon: 'folder' },
    { name: 'Downloads', type: 'folder', modified: '2026-07-02', icon: 'folder' },
    { name: 'Music', type: 'folder', modified: '2026-06-15', icon: 'folder' },
    { name: 'Pictures', type: 'folder', modified: '2026-06-20', icon: 'folder' },
    { name: 'Videos', type: 'folder', modified: '2026-06-25', icon: 'folder' },
    { name: '.bashrc', type: 'file', size: '2.4KB', modified: '2026-06-10', icon: 'text' },
    { name: '.zshrc', type: 'file', size: '3.1KB', modified: '2026-06-15', icon: 'text' },
  ],
  '~/Desktop': [
    { name: 'project', type: 'folder', modified: '2026-07-01', icon: 'folder' },
    { name: 'README.md', type: 'file', size: '1.2KB', modified: '2026-07-01', icon: 'text' },
    { name: 'screenshot.png', type: 'file', size: '245KB', modified: '2026-06-30', icon: 'image' },
    { name: 'notes.txt', type: 'file', size: '4.5KB', modified: '2026-06-28', icon: 'text' },
  ],
  '~/Documents': [
    { name: 'work', type: 'folder', modified: '2026-06-28', icon: 'folder' },
    { name: 'personal', type: 'folder', modified: '2026-06-20', icon: 'folder' },
    { name: 'resume.pdf', type: 'file', size: '156KB', modified: '2026-06-25', icon: 'text' },
    { name: 'budget.xlsx', type: 'file', size: '23KB', modified: '2026-06-22', icon: 'text' },
  ],
  '~/Downloads': [
    { name: 'archlinux.iso', type: 'file', size: '850MB', modified: '2026-07-02', icon: 'film' },
    { name: 'steam.deb', type: 'file', size: '156MB', modified: '2026-07-01', icon: 'text' },
    { name: 'wallpaper.jpg', type: 'file', size: '3.2MB', modified: '2026-06-30', icon: 'image' },
    { name: 'song.mp3', type: 'file', size: '8.5MB', modified: '2026-06-29', icon: 'music' },
  ],
  '~/Music': [
    { name: 'playlist1', type: 'folder', modified: '2026-06-15', icon: 'folder' },
    { name: 'song1.mp3', type: 'file', size: '8.2MB', modified: '2026-06-10', icon: 'music' },
    { name: 'song2.mp3', type: 'file', size: '6.8MB', modified: '2026-06-12', icon: 'music' },
    { name: 'album', type: 'folder', modified: '2026-06-14', icon: 'folder' },
  ],
  '~/Pictures': [
    { name: 'wallpapers', type: 'folder', modified: '2026-06-20', icon: 'folder' },
    { name: 'screenshots', type: 'folder', modified: '2026-06-25', icon: 'folder' },
    { name: 'photo1.jpg', type: 'file', size: '2.1MB', modified: '2026-06-18', icon: 'image' },
    { name: 'photo2.jpg', type: 'file', size: '1.8MB', modified: '2026-06-19', icon: 'image' },
  ],
  '~/Videos': [
    { name: 'movie1.mp4', type: 'file', size: '1.2GB', modified: '2026-06-25', icon: 'film' },
    { name: 'tutorial.mp4', type: 'file', size: '156MB', modified: '2026-06-22', icon: 'film' },
    { name: 'clip.mp4', type: 'file', size: '45MB', modified: '2026-06-20', icon: 'film' },
  ],
};

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState('~');
  /* viewMode is list */

  const files = FILE_DATA[currentPath] || [];

  const navigateTo = (name: string, type: string) => {
    if (type === 'folder') {
      const newPath = currentPath === '~' ? `~/${name}` : `${currentPath}/${name}`;
      setCurrentPath(newPath);
    }
  };

  const goUp = () => {
    if (currentPath === '~') return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/') || '~');
  };

  const getIcon = (icon: string, type: string) => {
    switch (icon) {
      case 'folder': return <Folder size={18} className="text-yellow-500" />;
      case 'text': return <FileText size={18} className="text-blue-400" />;
      case 'image': return <Image size={18} className="text-purple-400" />;
      case 'music': return <Music size={18} className="text-green-400" />;
      case 'film': return <Film size={18} className="text-red-400" />;
      default: return type === 'folder' ? <Folder size={18} className="text-yellow-500" /> : <FileText size={18} className="text-blue-400" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.9)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <button onClick={goUp} className="p-1 rounded hover:bg-white/10 transition-colors"><ArrowUp size={14} /></button>
        <button onClick={() => setCurrentPath('~')} className="p-1 rounded hover:bg-white/10 transition-colors"><Home size={14} /></button>
        <div className="flex-1 flex items-center gap-1 px-2 py-1 rounded text-xs font-mono" style={{ background: 'rgba(0, 40, 85, 0.5)' }}>
          <span className="text-cyan">~</span>
          {currentPath !== '~' && currentPath.slice(1).split('/').map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight size={10} className="text-muted-foreground" />
              <span>{part}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Files */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[auto_1fr_100px_120px] gap-2 px-3 py-1.5 text-xs text-muted-foreground border-b border-white/5">
          <span></span>
          <span>名称</span>
          <span>大小</span>
          <span>修改日期</span>
        </div>
        {files.map((file, i) => (
          <button
            key={i}
            onClick={() => navigateTo(file.name, file.type)}
            className="w-full grid grid-cols-[auto_1fr_100px_120px] gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left items-center"
          >
            {getIcon(file.icon, file.type)}
            <span className="truncate">{file.name}</span>
            <span className="text-muted-foreground text-xs">{file.size || '--'}</span>
            <span className="text-muted-foreground text-xs">{file.modified}</span>
          </button>
        ))}
        {files.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            文件夹为空
          </div>
        )}
      </div>

      {/* Status */}
      <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-white/5">
        {files.length} 个项目
      </div>
    </div>
  );
}
