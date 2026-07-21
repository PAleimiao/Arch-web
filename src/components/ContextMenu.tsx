import { useEffect, useRef } from 'react';
import { FolderPlus, FileText, Image, Settings, RefreshCw } from 'lucide-react';
import { useDesktopStore } from '@/store/desktopStore';

export default function ContextMenu() {
  const { contextMenu, setContextMenu, openWindow } = useDesktopStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu?.visible) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenu, setContextMenu]);

  if (!contextMenu?.visible) return null;

  const handleAction = (action: string) => {
    switch (action) {
      case 'newfolder':
        openWindow('filemanager', '文件管理器', 800, 550);
        break;
      case 'newdoc':
        openWindow('typora', 'Typora', 800, 600);
        break;
      case 'wallpaper':
        openWindow('settings', '系统设置', 700, 520);
        break;
      case 'settings':
        openWindow('settings', '系统设置', 700, 520);
        break;
    }
    setContextMenu(null);
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[10001] w-48 glass-panel-strong rounded-lg py-1.5 animate-fadeIn"
      style={{ 
        left: contextMenu.x, 
        top: contextMenu.y,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <button onClick={() => handleAction('newfolder')} className="context-menu-item w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left">
        <FolderPlus size={14} className="text-yellow-400" />
        <span>新建文件夹</span>
      </button>
      <button onClick={() => handleAction('newdoc')} className="context-menu-item w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left">
        <FileText size={14} className="text-blue-400" />
        <span>新建文档</span>
      </button>
      <div className="h-px bg-white/10 my-1" />
      <button onClick={() => handleAction('wallpaper')} className="context-menu-item w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left">
        <Image size={14} className="text-purple-400" />
        <span>更换壁纸</span>
      </button>
      <button onClick={() => handleAction('settings')} className="context-menu-item w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left">
        <Settings size={14} className="text-cyan-400" />
        <span>桌面设置</span>
      </button>
      <div className="h-px bg-white/10 my-1" />
      <button onClick={() => { window.location.reload(); }} className="context-menu-item w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left">
        <RefreshCw size={14} className="text-green-400" />
        <span>刷新</span>
      </button>
    </div>
  );
}
