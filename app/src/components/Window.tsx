import { useRef, useState, useCallback, useEffect } from 'react';
import { Minus, Square, X, GripHorizontal } from 'lucide-react';
import { useDesktopStore } from '@/store/desktopStore';
import type { WindowState } from '@/types';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function WindowComponent({ window: win, children }: WindowProps) {
  const { closeWindow, focusWindow, minimizeWindow, maximizeWindow, restoreWindow, setWindowPosition } = useDesktopStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const windowRef = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    focusWindow(win.id);
    if (win.isMaximized || isMobile) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - win.x, y: e.clientY - win.y });
  }, [win.id, win.x, win.y, win.isMaximized, focusWindow, isMobile]);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    focusWindow(win.id);
    if (win.isMaximized) return;
    const touch = e.touches[0];
    setDragOffset({ x: touch.clientX - win.x, y: touch.clientY - win.y });
    setIsDragging(true);
  }, [win.id, win.x, win.y, win.isMaximized, focusWindow]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 100));
      const newY = Math.max(40, Math.min(e.clientY - dragOffset.y, window.innerHeight - 40));
      setWindowPosition(win.id, newX, newY);
    };
    const handleMouseUp = () => setIsDragging(false);

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(touch.clientX - dragOffset.x, window.innerWidth - 100));
      const newY = Math.max(40, Math.min(touch.clientY - dragOffset.y, window.innerHeight - 40));
      setWindowPosition(win.id, newX, newY);
    };
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset, win.id, setWindowPosition]);

  if (win.isMinimized) return null;

  // Mobile: always fullscreen
  const style: React.CSSProperties = isMobile || win.isMaximized ? {
    position: 'fixed',
    top: 40,
    left: 0,
    width: '100%',
    height: 'calc(100% - 40px - 72px)',
    zIndex: win.zIndex,
  } : {
    position: 'fixed',
    left: win.x,
    top: win.y,
    width: win.width,
    height: win.height,
    zIndex: win.zIndex,
  };

  return (
    <div
      ref={windowRef}
      className="window-shadow rounded-lg sm:rounded-xl overflow-hidden flex flex-col animate-fadeIn"
      style={{
        ...style,
        background: 'rgba(0, 18, 51, 0.92)',
        backdropFilter: 'blur(20px)',
        border: win.isFocused ? '1px solid rgba(0, 180, 216, 0.3)' : '1px solid rgba(255,255,255,0.05)',
        opacity: isDragging ? 0.9 : 1,
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title Bar */}
      <div
        className="h-8 sm:h-9 flex items-center justify-between px-2 sm:px-3 select-none"
        style={{
          background: win.isFocused ? 'rgba(0, 40, 85, 0.7)' : 'rgba(0, 18, 51, 0.5)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          cursor: win.isMaximized || isMobile ? 'default' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <GripHorizontal size={10} className="text-muted-foreground flex-shrink-0 hidden sm:block" />
          <span className="text-[11px] sm:text-xs font-medium truncate" style={{ color: win.isFocused ? '#EEF4ED' : '#5C677D' }}>
            {win.title}
          </span>
        </div>

        <div className="window-controls flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <button onClick={() => minimizeWindow(win.id)}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
            <Minus size={10} className="text-yellow-400" />
          </button>
          <button onClick={() => win.isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id)}
            className="hidden sm:flex w-5 h-5 sm:w-6 sm:h-6 rounded items-center justify-center hover:bg-white/10 transition-colors">
            <Square size={10} className="text-green-400" />
          </button>
          <button onClick={() => closeWindow(win.id)}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center hover:bg-red-500/30 transition-colors">
            <X size={10} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
