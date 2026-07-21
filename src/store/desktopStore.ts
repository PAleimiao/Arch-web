import { create } from 'zustand';
import type { WindowState, TerminalLine, DesktopSettings } from '@/types';

const createStore = (create as any);

interface DesktopState {
  // Windows
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  
  // App Launcher
  isLauncherOpen: boolean;
  launcherCategory: string;
  launcherSearch: string;
  
  // Terminal
  terminalLines: TerminalLine[];
  terminalInput: string;
  
  // Context Menu
  contextMenu: { x: number; y: number; visible: boolean } | null;
  
  // Settings
  settings: DesktopSettings;
  
  // Actions
  openWindow: (appId: string, title: string, width: number, height: number) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  setWindowPosition: (id: string, x: number, y: number) => void;
  setWindowSize: (id: string, width: number, height: number) => void;
  
  setLauncherOpen: (open: boolean) => void;
  setLauncherCategory: (cat: string) => void;
  setLauncherSearch: (search: string) => void;
  
  addTerminalLine: (line: TerminalLine) => void;
  setTerminalInput: (input: string) => void;
  clearTerminal: () => void;
  
  setContextMenu: (menu: { x: number; y: number; visible: boolean } | null) => void;
  
  updateSettings: (settings: Partial<DesktopSettings>) => void;
}

export const useDesktopStore = createStore((set: any, get: any) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,
  
  isLauncherOpen: false,
  launcherCategory: '全部',
  launcherSearch: '',
  
  terminalLines: [
    { type: 'info', content: 'Arch Linux Web Simulator v1.0.0' },
    { type: 'info', content: 'Kernel: web-6.8.0-arch1-1' },
    { type: 'info', content: 'Type "help" for available commands.' },
    { type: 'output', content: '' },
  ],
  terminalInput: '',
  
  contextMenu: null,
  
  settings: {
    wallpaper: '/videos/wallpaper.mp4',
    transparency: 0.75,
    showDock: true,
    dockPosition: 'bottom',
    darkMode: true,
  },
  
  openWindow: (appId, title, width, height) => {
    const state = get();
    const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const centerX = Math.max(50, (window.innerWidth - width) / 2 + (state.windows.length * 20) % 100);
    const centerY = Math.max(50, (window.innerHeight - height) / 2 + (state.windows.length * 20) % 100);
    
    const newWindow: WindowState = {
      id,
      appId,
      title,
      x: centerX,
      y: centerY,
      width,
      height,
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      zIndex: state.nextZIndex,
    };
    
    set({
      windows: [...state.windows.map(w => ({ ...w, isFocused: false })), newWindow],
      activeWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    });
    
    return id;
  },
  
  closeWindow: (id) => {
    const state = get();
    const remaining = state.windows.filter(w => w.id !== id);
    const newActiveId = remaining.length > 0 
      ? remaining.reduce((prev, curr) => curr.zIndex > prev.zIndex ? curr : prev).id 
      : null;
    set({
      windows: remaining.map(w => w.id === newActiveId ? { ...w, isFocused: true } : w),
      activeWindowId: newActiveId,
    });
  },
  
  focusWindow: (id) => {
    const state = get();
    const newZ = state.nextZIndex;
    set({
      windows: state.windows.map(w => ({
        ...w,
        isFocused: w.id === id,
        zIndex: w.id === id ? newZ : w.zIndex,
      })),
      activeWindowId: id,
      nextZIndex: newZ + 1,
    });
  },
  
  minimizeWindow: (id) => {
    const state = get();
    const remaining = state.windows.filter(w => w.id !== id);
    const newActiveId = remaining.length > 0
      ? remaining.reduce((prev, curr) => curr.zIndex > prev.zIndex ? curr : prev, remaining[0]).id
      : null;
    set({
      windows: state.windows.map(w => w.id === id ? { ...w, isMinimized: true, isFocused: false } : w),
      activeWindowId: newActiveId,
    });
  },
  
  maximizeWindow: (id) => {
    const state = get();
    set({
      windows: state.windows.map(w => w.id === id ? { ...w, isMaximized: true, isFocused: true, zIndex: state.nextZIndex } : { ...w, isFocused: false }),
      activeWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    });
  },
  
  restoreWindow: (id) => {
    const state = get();
    const win = state.windows.find(w => w.id === id);
    if (!win) return;
    set({
      windows: state.windows.map(w => w.id === id ? { ...w, isMinimized: false, isMaximized: false, isFocused: true, zIndex: state.nextZIndex } : { ...w, isFocused: false }),
      activeWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    });
  },
  
  setWindowPosition: (id, x, y) => {
    const state = get();
    set({
      windows: state.windows.map(w => w.id === id ? { ...w, x, y } : w),
    });
  },
  
  setWindowSize: (id, width, height) => {
    const state = get();
    set({
      windows: state.windows.map(w => w.id === id ? { ...w, width, height } : w),
    });
  },
  
  setLauncherOpen: (open) => set({ isLauncherOpen: open }),
  setLauncherCategory: (cat) => set({ launcherCategory: cat }),
  setLauncherSearch: (search) => set({ launcherSearch: search }),
  
  addTerminalLine: (line) => set((state) => ({ terminalLines: [...state.terminalLines, line] })),
  setTerminalInput: (input) => set({ terminalInput: input }),
  clearTerminal: () => set({ terminalLines: [], terminalInput: '' }),
  
  setContextMenu: (menu) => set({ contextMenu: menu }),
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),
}));
