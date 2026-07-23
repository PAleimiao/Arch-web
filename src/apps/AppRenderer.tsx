import Terminal from './Terminal';
import FileManager from './FileManager';
import Settings from './Settings';
import SystemMonitor from './SystemMonitor';
import DiskUsage from './DiskUsage';
import Calculator from './Calculator';
import Calendar from './Calendar';
import Todo from './Todo';
import Weather from './Weather';
import Notes from './Notes';
import CodeEditor from './CodeEditor';
import Browser from './Browser';
import MusicPlayer from './MusicPlayer';
import VideoPlayer from './VideoPlayer';
import QQ from './QQ';
import WeChat from './WeChat';
import ChatApp from './ChatApp';
import Meeting from './Meeting';
import OBSStudio from './OBSStudio';
import SparkStore from './SparkStore';
import LinglongStore from './LinglongStore';
import Steam from './Steam';
import Tetris from './Tetris';
import Snake from './Snake';
import Minesweeper from './Minesweeper';
import Game2048 from './Game2048';
import Chess from './Chess';
import MarkdownEditor from './MarkdownEditor';
import Office from './Office';
import ImageEditor from './ImageEditor';
import VideoEditor from './VideoEditor';
import APITester from './APITester';
import DockerManager from './DockerManager';
import GitGUI from './GitGUI';
import DatabaseClient from './DatabaseClient';
import NetworkAnalyzer from './NetworkAnalyzer';
import ProxyManager from './ProxyManager';
import CloudStorage from './CloudStorage';
import Downloader from './Downloader';
import VideoPlatform from './VideoPlatform';
import AudioEditor from './AudioEditor';
import IDE from './IDE';
import FontManager from './FontManager';
import Screenshot from './Screenshot';
import BackupTool from './BackupTool';
import Cleaner from './Cleaner';
import Minecraft from './Minecraft';
import Blender from './Blender';
import EbookReader from './EbookReader';
import DocumentViewer from './DocumentViewer';
import FTPClient from './FTPClient';
import VectorEditor from './VectorEditor';
import ClockApp from './Clock';
import StickyNotes from './StickyNotes';
import PasswordManager from './PasswordManager';
import ColorPicker from './ColorPicker';
import FlappyBird from './FlappyBird';
import Breakout from './Breakout';
import Pong from './Pong';
import TicTacToe from './TicTacToe';
import NetworkSpeed from './NetworkSpeed';
import Notepad from './Notepad';
import IPQuery from './IPQuery';
import ADBTool from './ADBTool';
import Gomoku from './Gomoku';
import Sudoku from './Sudoku';
import MemoryGame from './MemoryGame';
import Solitaire from './Solitaire';
import GTA from './GTA';

interface AppRendererProps {
  appId: string;
  windowId: string;
}

const appComponents: Record<string, React.ComponentType<any>> = {
  // System
  terminal: Terminal,
  filemanager: FileManager,
  settings: Settings,
  'system-monitor': SystemMonitor,
  'disk-usage': DiskUsage,
  baobab: DiskUsage,
  gparted: DiskUsage,
  screenshot: Screenshot,
  'font-manager': FontManager,
  timeshift: BackupTool,
  bleachbit: Cleaner,
  'network-speed': NetworkSpeed,
  notepad: Notepad,
  downloader: Downloader,
  'cloud-storage': CloudStorage,
  'ip-query': IPQuery,
  'adb-tool': ADBTool,
  // Office
  calculator: Calculator,
  calendar: Calendar,
  todo: Todo,
  weather: Weather,
  notion: Notes,
  typora: MarkdownEditor,
  wps: Office,
  libreoffice: Office,
  clock: ClockApp,
  'sticky-notes': StickyNotes,
  'password-manager': PasswordManager,
  'color-picker': ColorPicker,
  // Dev
  vscode: CodeEditor,
  sublime: CodeEditor,
  vim: Terminal,
  neovim: Terminal,
  postman: APITester,
  insomnia: APITester,
  docker: DockerManager,
  dbeaver: DatabaseClient,
  tableplus: DatabaseClient,
  gitkraken: GitGUI,
  'github-desktop': GitGUI,
  wireshark: NetworkAnalyzer,
  'jetbrains-toolbox': IDE,
  // Network
  firefox: Browser,
  chrome: Browser,
  edge: Browser,
  thunder: Downloader,
  baidunetdisk: CloudStorage,
  aliyundrive: CloudStorage,
  clash: ProxyManager,
  filezilla: FTPClient,
  // Media
  obs: OBSStudio,
  'netease-music': MusicPlayer,
  'qq-music': MusicPlayer,
  vlc: VideoPlayer,
  mpv: VideoPlayer,
  'tencent-video': VideoPlatform,
  bilibili: VideoPlatform,
  kdenlive: VideoEditor,
  audacity: AudioEditor,
  // Social
  qq: QQ,
  wechat: WeChat,
  dingtalk: ChatApp,
  feishu: ChatApp,
  telegram: ChatApp,
  discord: ChatApp,
  'tencent-meeting': Meeting,
  zoom: Meeting,
  // Games
  steam: Steam,
  minecraft: Minecraft,
  tetris: Tetris,
  snake: Snake,
  minesweeper: Minesweeper,
  '2048': Game2048,
  chess: Chess,
  'flappy-bird': FlappyBird,
  breakout: Breakout,
  pong: Pong,
  'tic-tac-toe': TicTacToe,
  gomoku: Gomoku,
  sudoku: Sudoku,
  'memory-game': MemoryGame,
  solitaire: Solitaire,
  gta: GTA,
  // Graphics
  gimp: ImageEditor,
  krita: ImageEditor,
  inkscape: VectorEditor,
  blender: Blender,
  foliate: EbookReader,
  okular: DocumentViewer,
  // Stores
  'spark-store': SparkStore,
  linglong: LinglongStore,
};

export default function AppRenderer({ appId, windowId }: AppRendererProps) {
  // 音乐播放器特殊处理：根据入口自动选中对应平台
  if (appId === 'netease-music' || appId === 'qq-music') {
    const MusicPlayerComp = appComponents[appId];
    const defaultPlatform = appId === 'netease-music' ? 'netease' : 'qq';
    return <MusicPlayerComp windowId={windowId} defaultPlatform={defaultPlatform} />;
  }

  const Component = appComponents[appId];

  if (!Component) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">?</div>
          <div>应用程序加载中...</div>
          <div className="text-xs mt-1 opacity-50">{appId}</div>
        </div>
      </div>
    );
  }

  return <Component windowId={windowId} />;
}
