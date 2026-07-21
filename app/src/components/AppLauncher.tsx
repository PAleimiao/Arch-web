import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '@/store/desktopStore';
import { APPS, APP_CATEGORIES, getAppsByCategory } from '@/apps/config';

export default function AppLauncher() {
  const { isLauncherOpen, setLauncherOpen, openWindow, launcherCategory, setLauncherCategory, launcherSearch, setLauncherSearch } = useDesktopStore();
  const [activeCategory, setActiveCategory] = useState(launcherCategory);
  const [searchText, setSearchText] = useState(launcherSearch);
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLauncherOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isLauncherOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Super') {
        e.preventDefault();
        setLauncherOpen(!isLauncherOpen);
      }
      if (e.key === 'Escape' && isLauncherOpen) {
        setLauncherOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLauncherOpen, setLauncherOpen]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    setLauncherSearch(text);
  }, [setLauncherSearch]);

  const handleCategory = useCallback((cat: string) => {
    setActiveCategory(cat);
    setLauncherCategory(cat);
  }, [setLauncherCategory]);

  const handleLaunch = (app: typeof APPS[0]) => {
    openWindow(app.id, app.name, app.defaultWidth, app.defaultHeight);
    setLauncherOpen(false);
    setSearchText('');
    setLauncherSearch('');
  };

  const filteredApps = searchText.trim()
    ? APPS.filter(app => app.name.toLowerCase().includes(searchText.toLowerCase()) || app.description.toLowerCase().includes(searchText.toLowerCase()))
    : getAppsByCategory(activeCategory);

  if (!isLauncherOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center pt-12 sm:pt-16"
      style={{ background: 'rgba(0, 18, 51, 0.9)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setLauncherOpen(false); }}>

      {/* Search Bar */}
      <div className="w-full max-w-lg sm:max-w-2xl px-4 mb-4 sm:mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索应用程序..."
            className="w-full h-10 sm:h-12 pl-9 sm:pl-11 pr-10 sm:pr-12 rounded-xl glass-panel-strong text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all text-sm sm:text-base"
            style={{ border: '1px solid rgba(0, 180, 216, 0.15)' }}
          />
          {searchText && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      {!searchText && (
        <div className="flex gap-1 mb-3 sm:mb-4 px-4 overflow-x-auto pb-2 max-w-full scrollbar-none">
          {APP_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: activeCategory === cat ? 'rgba(0, 180, 216, 0.2)' : 'transparent',
                color: activeCategory === cat ? '#00B4D8' : '#979DAC',
                border: activeCategory === cat ? '1px solid rgba(0, 180, 216, 0.3)' : '1px solid transparent',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* App Grid */}
      <div ref={containerRef} className="flex-1 overflow-y-auto w-full max-w-5xl px-4 pb-24 sm:pb-8">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
          {filteredApps.map((app) => {
            const IconC = (Icons as any)[app.icon] || Icons.Circle;
            return (
              <button
                key={app.id}
                onClick={() => handleLaunch(app)}
                className="app-icon-card flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all touch-target"
                style={{ background: 'rgba(0, 40, 85, 0.4)' }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md sm:rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${app.color}25, ${app.color}10)` }}>
                  <IconC size={20} className="sm:hidden" style={{ color: app.color }} />
                  <IconC size={24} className="hidden sm:block" style={{ color: app.color }} />
                </div>
                <span className="text-[10px] sm:text-xs text-center leading-tight truncate w-full" style={{ color: '#EEF4ED' }}>{app.name}</span>
              </button>
            );
          })}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center text-muted-foreground py-12 text-sm">
            未找到匹配的应用程序
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-4 text-[10px] sm:text-xs text-muted-foreground">
        <kbd className="px-1 py-0.5 rounded bg-white/10 text-cyan-400 font-mono">Super</kbd> 或 <kbd className="px-1 py-0.5 rounded bg-white/10 text-cyan-400 font-mono">Esc</kbd> 关闭
      </div>
    </div>
  );
}
