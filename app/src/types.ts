export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
}

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  component: string;
  color: string;
}

export interface TerminalLine {
  type: 'prompt' | 'output' | 'error' | 'info';
  content: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  avatar?: string;
}

export interface DesktopSettings {
  wallpaper: string;
  transparency: number;
  showDock: boolean;
  dockPosition: 'bottom' | 'left' | 'right';
  darkMode: boolean;
}
