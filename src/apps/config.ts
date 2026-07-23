import type { AppConfig } from '@/types';

export const APP_CATEGORIES = [
  '全部', '网络', '社交', '影音', '开发', '办公', '系统', '工具', '游戏', '图形'
];

export const APPS: AppConfig[] = [
  // ===== 网络 =====
  { id: 'firefox', name: '火狐浏览器', icon: 'Globe', category: '网络', description: '开源网页浏览器', defaultWidth: 1000, defaultHeight: 650, component: 'Browser', color: '#FF7139' },
  { id: 'chrome', name: 'Chrome', icon: 'Chrome', category: '网络', description: 'Google 浏览器', defaultWidth: 1000, defaultHeight: 650, component: 'Browser', color: '#4285F4' },
  { id: 'edge', name: 'Edge', icon: 'Globe', category: '网络', description: '微软浏览器', defaultWidth: 1000, defaultHeight: 650, component: 'Browser', color: '#0078D7' },
  { id: 'thunder', name: '迅雷', icon: 'Zap', category: '网络', description: '高速下载工具', defaultWidth: 700, defaultHeight: 500, component: 'Downloader', color: '#00A0E9' },
  { id: 'baidunetdisk', name: '百度网盘', icon: 'Cloud', category: '网络', description: '云存储服务', defaultWidth: 800, defaultHeight: 550, component: 'CloudStorage', color: '#2932E1' },
  { id: 'aliyundrive', name: '阿里云盘', icon: 'Cloud', category: '网络', description: '阿里云存储', defaultWidth: 800, defaultHeight: 550, component: 'CloudStorage', color: '#FF6A00' },
  { id: 'clash', name: 'Clash', icon: 'Shield', category: '网络', description: '网络代理工具', defaultWidth: 600, defaultHeight: 450, component: 'ProxyManager', color: '#4A90D9' },
  { id: 'filezilla', name: 'FileZilla', icon: 'Server', category: '网络', description: 'FTP 客户端', defaultWidth: 700, defaultHeight: 500, component: 'FTPClient', color: '#BF0000' },

  // ===== 社交 =====
  { id: 'qq', name: 'QQ', icon: 'MessageCircle', category: '社交', description: '即时通讯软件', defaultWidth: 350, defaultHeight: 650, component: 'QQ', color: '#12B7F5' },
  { id: 'wechat', name: '微信', icon: 'MessageSquare', category: '社交', description: '微信桌面版', defaultWidth: 380, defaultHeight: 680, component: 'WeChat', color: '#07C160' },
  { id: 'dingtalk', name: '钉钉', icon: 'Bell', category: '社交', description: '企业通讯', defaultWidth: 400, defaultHeight: 650, component: 'ChatApp', color: '#3370FF' },
  { id: 'feishu', name: '飞书', icon: 'Feather', category: '社交', description: '协作办公平台', defaultWidth: 400, defaultHeight: 650, component: 'ChatApp', color: '#00D6B9' },
  { id: 'telegram', name: 'Telegram', icon: 'Send', category: '社交', description: '加密通讯', defaultWidth: 380, defaultHeight: 620, component: 'ChatApp', color: '#0088CC' },
  { id: 'discord', name: 'Discord', icon: 'Headphones', category: '社交', description: '语音聊天社区', defaultWidth: 400, defaultHeight: 600, component: 'ChatApp', color: '#5865F2' },
  { id: 'tencent-meeting', name: '腾讯会议', icon: 'Video', category: '社交', description: '视频会议软件', defaultWidth: 600, defaultHeight: 450, component: 'Meeting', color: '#006EFF' },
  { id: 'zoom', name: 'Zoom', icon: 'Video', category: '社交', description: '视频会议', defaultWidth: 600, defaultHeight: 450, component: 'Meeting', color: '#2D8CFF' },

  // ===== 影音 =====
  { id: 'obs', name: 'OBS Studio', icon: 'Camera', category: '影音', description: '开源直播录制软件', defaultWidth: 900, defaultHeight: 600, component: 'OBSStudio', color: '#302E31' },
  { id: 'netease-music', name: '网易云音乐', icon: 'Music', category: '影音', description: '在线音乐播放器', defaultWidth: 850, defaultHeight: 550, component: 'MusicPlayer', color: '#C20C0C' },
  { id: 'qq-music', name: 'QQ音乐', icon: 'Music', category: '影音', description: '聚合音乐播放器 — 支持网易云/QQ/酷狗/B站/本地切换', defaultWidth: 850, defaultHeight: 550, component: 'MusicPlayer', color: '#31C27C' },
  { id: 'vlc', name: 'VLC', icon: 'Play', category: '影音', description: '万能媒体播放器', defaultWidth: 700, defaultHeight: 450, component: 'VideoPlayer', color: '#E85A00' },
  { id: 'mpv', name: 'MPV', icon: 'PlayCircle', category: '影音', description: '极简播放器', defaultWidth: 600, defaultHeight: 400, component: 'VideoPlayer', color: '#691F69' },
  { id: 'tencent-video', name: '腾讯视频', icon: 'Tv', category: '影音', description: '视频流媒体', defaultWidth: 900, defaultHeight: 580, component: 'VideoPlatform', color: '#00BE06' },
  { id: 'bilibili', name: '哔哩哔哩', icon: 'Tv', category: '影音', description: '弹幕视频网站', defaultWidth: 900, defaultHeight: 580, component: 'VideoPlatform', color: '#FB7299' },
  { id: 'kdenlive', name: 'Kdenlive', icon: 'Scissors', category: '影音', description: '视频编辑器', defaultWidth: 1100, defaultHeight: 650, component: 'VideoEditor', color: '#527EB2' },
  { id: 'audacity', name: 'Audacity', icon: 'Mic', category: '影音', description: '音频编辑器', defaultWidth: 800, defaultHeight: 500, component: 'AudioEditor', color: '#2D69B4' },

  // ===== 开发 =====
  { id: 'vscode', name: 'VS Code', icon: 'Code2', category: '开发', description: '代码编辑器', defaultWidth: 950, defaultHeight: 650, component: 'CodeEditor', color: '#007ACC' },
  { id: 'jetbrains-toolbox', name: 'JetBrains', icon: 'Boxes', category: '开发', description: 'IDE 工具箱', defaultWidth: 600, defaultHeight: 500, component: 'IDE', color: '#000000' },
  { id: 'sublime', name: 'Sublime Text', icon: 'FileCode', category: '开发', description: '轻量编辑器', defaultWidth: 800, defaultHeight: 550, component: 'CodeEditor', color: '#FF9800' },
  { id: 'vim', name: 'Neovim', icon: 'Terminal', category: '开发', description: '终端编辑器', defaultWidth: 700, defaultHeight: 500, component: 'Terminal', color: '#019733' },
  { id: 'postman', name: 'Postman', icon: 'Send', category: '开发', description: 'API 测试工具', defaultWidth: 850, defaultHeight: 600, component: 'APITester', color: '#FF6C37' },
  { id: 'insomnia', name: 'Insomnia', icon: 'Moon', category: '开发', description: 'REST 客户端', defaultWidth: 800, defaultHeight: 550, component: 'APITester', color: '#4000BF' },
  { id: 'docker', name: 'Docker Desktop', icon: 'Container', category: '开发', description: '容器管理平台', defaultWidth: 900, defaultHeight: 600, component: 'DockerManager', color: '#2496ED' },
  { id: 'dbeaver', name: 'DBeaver', icon: 'Database', category: '开发', description: '数据库管理工具', defaultWidth: 900, defaultHeight: 600, component: 'DatabaseClient', color: '#897363' },
  { id: 'gitkraken', name: 'GitKraken', icon: 'GitBranch', category: '开发', description: 'Git GUI 客户端', defaultWidth: 850, defaultHeight: 580, component: 'GitGUI', color: '#179287' },
  { id: 'github-desktop', name: 'GitHub Desktop', icon: 'Github', category: '开发', description: 'GitHub 客户端', defaultWidth: 800, defaultHeight: 550, component: 'GitGUI', color: '#24292E' },
  { id: 'tableplus', name: 'TablePlus', icon: 'Table', category: '开发', description: '数据库客户端', defaultWidth: 850, defaultHeight: 550, component: 'DatabaseClient', color: '#E38935' },
  { id: 'wireshark', name: 'Wireshark', icon: 'Activity', category: '开发', description: '网络协议分析', defaultWidth: 950, defaultHeight: 600, component: 'NetworkAnalyzer', color: '#1679A7' },

  // ===== 办公 =====
  { id: 'wps', name: 'WPS Office', icon: 'FileText', category: '办公', description: '办公软件套件', defaultWidth: 900, defaultHeight: 620, component: 'Office', color: '#E60012' },
  { id: 'libreoffice', name: 'LibreOffice', icon: 'FileSpreadsheet', category: '办公', description: '开源办公套件', defaultWidth: 900, defaultHeight: 620, component: 'Office', color: '#18A303' },
  { id: 'typora', name: 'Typora', icon: 'FileType', category: '办公', description: 'Markdown 编辑器', defaultWidth: 800, defaultHeight: 600, component: 'MarkdownEditor', color: '#4A86C7' },
  { id: 'notion', name: 'Notion', icon: 'NotebookPen', category: '办公', description: '笔记与协作', defaultWidth: 850, defaultHeight: 600, component: 'Notes', color: '#000000' },
  { id: 'calculator', name: '计算器', icon: 'Calculator', category: '办公', description: '科学计算器', defaultWidth: 340, defaultHeight: 500, component: 'Calculator', color: '#6366F1' },
  { id: 'calendar', name: '日历', icon: 'Calendar', category: '办公', description: '日程管理', defaultWidth: 500, defaultHeight: 450, component: 'Calendar', color: '#8B5CF6' },
  { id: 'todo', name: '待办事项', icon: 'CheckSquare', category: '办公', description: '任务管理', defaultWidth: 400, defaultHeight: 550, component: 'Todo', color: '#10B981' },
  { id: 'weather', name: '天气', icon: 'CloudSun', category: '办公', description: '天气预报', defaultWidth: 380, defaultHeight: 500, component: 'Weather', color: '#3B82F6' },
  { id: 'clock', name: '时钟', icon: 'Clock', category: '办公', description: '世界时钟和闹钟', defaultWidth: 450, defaultHeight: 500, component: 'Clock', color: '#F59E0B' },
  { id: 'sticky-notes', name: '便签', icon: 'StickyNote', category: '办公', description: '桌面便签', defaultWidth: 300, defaultHeight: 350, component: 'StickyNotes', color: '#F4D03F' },
  { id: 'password-manager', name: '密码管理', icon: 'KeyRound', category: '办公', description: '安全密码存储', defaultWidth: 500, defaultHeight: 450, component: 'PasswordManager', color: '#10B981' },
  { id: 'color-picker', name: '取色器', icon: 'EyeDropper', category: '办公', description: '颜色选择工具', defaultWidth: 400, defaultHeight: 420, component: 'ColorPicker', color: '#EC4899' },
  { id: 'notepad', name: '记事本', icon: 'FileEdit', category: '办公', description: '文本编辑器', defaultWidth: 700, defaultHeight: 500, component: 'Notepad', color: '#6366F1' },
  { id: 'ip-query', name: 'IP查询', icon: 'Globe', category: '工具', description: 'IP地址查询工具', defaultWidth: 420, defaultHeight: 520, component: 'IPQuery', color: '#06B6D4' },
  { id: 'adb-tool', name: 'ADB调试', icon: 'Cable', category: '工具', description: 'ADB网络调试工具', defaultWidth: 500, defaultHeight: 560, component: 'ADBTool', color: '#10B981' },

  // ===== 系统 =====
  { id: 'settings', name: '系统设置', icon: 'Settings', category: '系统', description: '系统配置', defaultWidth: 700, defaultHeight: 520, component: 'Settings', color: '#6B7280' },
  { id: 'filemanager', name: '文件管理器', icon: 'FolderOpen', category: '系统', description: '文件浏览', defaultWidth: 800, defaultHeight: 550, component: 'FileManager', color: '#F59E0B' },
  { id: 'terminal', name: '终端', icon: 'TerminalSquare', category: '系统', description: '命令行终端', defaultWidth: 700, defaultHeight: 450, component: 'Terminal', color: '#00B4D8' },
  { id: 'system-monitor', name: '系统监视器', icon: 'Activity', category: '系统', description: '进程与资源监控', defaultWidth: 750, defaultHeight: 480, component: 'SystemMonitor', color: '#EF4444' },
  { id: 'disk-usage', name: '磁盘分析', icon: 'HardDrive', category: '系统', description: '磁盘空间分析', defaultWidth: 650, defaultHeight: 450, component: 'DiskUsage', color: '#14B8A6' },
  { id: 'font-manager', name: '字体管理', icon: 'Type', category: '系统', description: '字体管理工具', defaultWidth: 650, defaultHeight: 450, component: 'FontManager', color: '#EC4899' },
  { id: 'screenshot', name: '截图工具', icon: 'Camera', category: '系统', description: '屏幕截图', defaultWidth: 500, defaultHeight: 380, component: 'Screenshot', color: '#8B5CF6' },
  { id: 'network-speed', name: '网速测试', icon: 'Gauge', category: '系统', description: '网络速度测试', defaultWidth: 500, defaultHeight: 400, component: 'NetworkSpeed', color: '#06B6D4' },

  // ===== 工具 =====
  { id: 'spark-store', name: '星火应用商店', icon: 'Sparkles', category: '工具', description: 'Deepin 应用商店', defaultWidth: 900, defaultHeight: 620, component: 'SparkStore', color: '#E60012' },
  { id: 'linglong', name: '玲珑应用商店', icon: 'Package', category: '工具', description: '玲珑包管理', defaultWidth: 900, defaultHeight: 620, component: 'LinglongStore', color: '#00B4D8' },
  { id: 'baobab', name: '磁盘使用分析', icon: 'PieChart', category: '工具', description: '可视化磁盘占用', defaultWidth: 600, defaultHeight: 450, component: 'DiskUsage', color: '#F97316' },
  { id: 'gparted', name: 'GParted', icon: 'LayoutGrid', category: '工具', description: '分区编辑器', defaultWidth: 700, defaultHeight: 450, component: 'DiskUsage', color: '#84CC16' },
  { id: 'timeshift', name: 'Timeshift', icon: 'Clock', category: '工具', description: '系统快照备份', defaultWidth: 600, defaultHeight: 400, component: 'BackupTool', color: '#06B6D4' },
  { id: 'bleachbit', name: 'BleachBit', icon: 'Trash2', category: '工具', description: '系统清理工具', defaultWidth: 600, defaultHeight: 450, component: 'Cleaner', color: '#EF4444' },

      // ===== 游戏 =====
  { id: 'steam', name: '游戏中心', icon: 'Gamepad2', category: '游戏', description: 'GTA 网页版 — 无需下载，浏览器即开即玩', defaultWidth: 950, defaultHeight: 620, component: 'Steam', color: '#1B2838' },
  { id: 'tetris', name: '俄罗斯方块', icon: 'Grid3X3', category: '游戏', description: '经典益智游戏', defaultWidth: 380, defaultHeight: 600, component: 'Tetris', color: '#9333EA' },
  { id: 'snake', name: '贪吃蛇', icon: 'Snail', category: '游戏', description: '经典街机游戏', defaultWidth: 420, defaultHeight: 480, component: 'Snake', color: '#16A34A' },
  { id: 'minesweeper', name: '扫雷', icon: 'Bomb', category: '游戏', description: '经典逻辑游戏', defaultWidth: 400, defaultHeight: 450, component: 'Minesweeper', color: '#DC2626' },
  { id: '2048', name: '2048', icon: 'Hash', category: '游戏', description: '数字益智游戏', defaultWidth: 400, defaultHeight: 520, component: 'Game2048', color: '#D97706' },
  { id: 'chess', name: '国际象棋', icon: 'Crown', category: '游戏', description: '策略棋盘游戏', defaultWidth: 520, defaultHeight: 560, component: 'Chess', color: '#92400E' },
  { id: 'flappy-bird', name: 'Flappy Bird', icon: 'Bird', category: '游戏', description: '飞行小游戏', defaultWidth: 380, defaultHeight: 520, component: 'FlappyBird', color: '#F4D03F' },
  { id: 'breakout', name: '打砖块', icon: 'Square', category: '游戏', description: '弹球打砖块', defaultWidth: 420, defaultHeight: 500, component: 'Breakout', color: '#F97316' },
  { id: 'pong', name: '乒乓球', icon: 'Circle', category: '游戏', description: '经典对战', defaultWidth: 440, defaultHeight: 320, component: 'Pong', color: '#00B4D8' },
  { id: 'tic-tac-toe', name: '井字棋', icon: 'X', category: '游戏', description: '三子棋对战', defaultWidth: 380, defaultHeight: 420, component: 'TicTacToe', color: '#7C3AED' },
  { id: 'gomoku', name: '五子棋', icon: 'CircleDot', category: '游戏', description: '五子连线对战', defaultWidth: 520, defaultHeight: 580, component: 'Gomoku', color: '#5D4037' },
  { id: 'sudoku', name: '数独', icon: 'Grid3X3', category: '游戏', description: '数字逻辑益智', defaultWidth: 420, defaultHeight: 520, component: 'Sudoku', color: '#1565C0' },
  { id: 'memory-game', name: '记忆翻牌', icon: 'Brain', category: '游戏', description: '记忆配对游戏', defaultWidth: 420, defaultHeight: 480, component: 'MemoryGame', color: '#7B1FA2' },
  { id: 'solitaire', name: '纸牌接龙', icon: 'Spade', category: '游戏', description: '经典纸牌游戏', defaultWidth: 520, defaultHeight: 480, component: 'Solitaire', color: '#2E7D32' },

// ===== 图形 =====
  { id: 'gimp', name: 'GIMP', icon: 'Palette', category: '图形', description: '图像编辑器', defaultWidth: 1000, defaultHeight: 650, component: 'ImageEditor', color: '#716955' },
  { id: 'krita', name: 'Krita', icon: 'Paintbrush', category: '图形', description: '数字绘画', defaultWidth: 1000, defaultHeight: 650, component: 'ImageEditor', color: '#3BABC9' },
  { id: 'inkscape', name: 'Inkscape', icon: 'PenTool', category: '图形', description: '矢量图形编辑', defaultWidth: 950, defaultHeight: 620, component: 'VectorEditor', color: '#303030' },
  { id: 'blender', name: 'Blender', icon: 'Box', category: '图形', description: '3D 建模', defaultWidth: 1050, defaultHeight: 680, component: 'Blender', color: '#E87D0D' },
  { id: 'foliate', name: 'Foliate', icon: 'BookOpen', category: '图形', description: '电子书阅读器', defaultWidth: 700, defaultHeight: 550, component: 'EbookReader', color: '#10B981' },
  { id: 'okular', name: 'Okular', icon: 'File', category: '图形', description: '文档查看器', defaultWidth: 750, defaultHeight: 580, component: 'DocumentViewer', color: '#F59E0B' },
];

export const getAppById = (id: string): AppConfig | undefined => APPS.find(app => app.id === id);
export const getAppsByCategory = (category: string): AppConfig[] =>
  category === '全部' ? APPS : APPS.filter(app => app.category === category);

export const DOCK_APPS = ['firefox', 'filemanager', 'terminal', 'vscode', 'qq', 'wechat', 'obs', 'netease-music', 'steam', 'settings', 'calculator', 'sudoku'];
