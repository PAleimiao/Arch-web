import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '@/store/desktopStore';
import { APPS, DOCK_APPS } from '@/apps/config';

export default function Dock() {
  const { openWindow, windows, restoreWindow, focusWindow, setLauncherOpen } = useDesktopStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dockApps = DOCK_APPS.map(id => APPS.find(a => a.id === id)).filter(Boolean);

  const openLauncher = () => setLauncherOpen(true);

  const handleClick = (app: NonNullable<typeof dockApps[0]>) => {
    const existingWindow = windows.find(w => w.appId === app.id && !w.isMinimized);
    if (existingWindow) {
      focusWindow(existingWindow.id);
    } else {
      const minimizedWindow = windows.find(w => w.appId === app.id && w.isMinimized);
      if (minimizedWindow) {
        restoreWindow(minimizedWindow.id);
      } else {
        openWindow(app.id, app.name, app.defaultWidth, app.defaultHeight);
      }
    }
  };

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return 1.5;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.05;
    return 1;
  };

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-[9998]">
      <div className="flex items-end gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl sm:rounded-3xl glass-panel-strong"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
        {/* Start Menu Button */}
        <button
          onClick={openLauncher}
          className="relative flex flex-col items-center group touch-target mr-1"
          onMouseEnter={() => setHoveredIndex(-1)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="absolute -top-8 sm:-top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="glass-panel-strong px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-xs whitespace-nowrap"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              应用菜单
            </div>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center transition-all"
            style={{
              background: hoveredIndex === -1
                ? 'linear-gradient(135deg, #00B4D840, #00B4D820)'
                : 'linear-gradient(135deg, #00B4D825, #00B4D810)',
              border: '1px solid rgba(0, 180, 216, 0.3)',
            }}>
            <Icons.LayoutGrid size={18} className="sm:hidden" style={{ color: '#00B4D8' }} />
            <Icons.LayoutGrid size={22} className="hidden sm:block" style={{ color: '#00B4D8' }} />
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-6 sm:h-8 bg-white/10 mx-0.5" />

        {dockApps.map((app, index) => {
          if (!app) return null;
          const IconComp = (Icons as any)[app.icon] || Icons.Circle;
          const scale = getScale(index);
          const hasWindow = windows.some(w => w.appId === app.id);

          return (
            <button
              key={app.id}
              className="dock-item relative flex flex-col items-center group touch-target"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleClick(app)}
              style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
            >
              {/* Tooltip */}
              <div className="absolute -top-8 sm:-top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="glass-panel-strong px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-xs whitespace-nowrap"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  {app.name}
                </div>
              </div>

              {/* Icon */}
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: `linear-gradient(135deg, ${app.color}30, ${app.color}15)`,
                  border: `1px solid ${app.color}40`,
                }}>
                <IconComp size={18} className="sm:hidden" style={{ color: app.color }} />
                <IconComp size={22} className="hidden sm:block" style={{ color: app.color }} />
              </div>

              {/* Dot indicator */}
              {hasWindow && (
                <div className="absolute -bottom-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
