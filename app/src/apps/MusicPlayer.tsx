import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart,
  ListMusic, Search, Loader2, Volume2, VolumeX, TrendingUp, Clock,
  AlertCircle, Disc3, Settings, X, Save, RotateCcw, Check, ExternalLink
} from 'lucide-react';

// Default Netease Cloud Music API endpoints
const DEFAULT_API_BASE = 'https://api-mymusic.vercel.app';
const DEFAULT_API_BACKUP = 'https://netease-cloud-music-api-wine.vercel.app';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  picUrl?: string;
}

interface SearchResult {
  id: number;
  name: string;
  artists: { name: string }[];
  album: { name: string; picUrl?: string };
  duration: number;
}

const FALLBACK_PLAYLIST: Song[] = [
  { id: 1330348068, title: '起风了', artist: '买辣椒也用券', album: '起风了', duration: 315 },
  { id: 185709, title: '稻香', artist: '周杰伦', album: '魔杰座', duration: 223 },
  { id: 186016, title: '晴天', artist: '周杰伦', album: '叶惠美', duration: 269 },
  { id: 28815250, title: '平凡之路', artist: '朴树', album: '猎户星座', duration: 302 },
  { id: 186019, title: '夜曲', artist: '周杰伦', album: '十一月的萧邦', duration: 227 },
  { id: 436514312, title: '成都', artist: '赵雷', album: '成都', duration: 336 },
  { id: 32507038, title: '演员', artist: '薛之谦', album: '绅士', duration: 261 },
  { id: 418603077, title: '告白气球', artist: '周杰伦', album: '周杰伦的床边故事', duration: 207 },
];

// Load saved API settings
function loadApiSettings() {
  try {
    const saved = localStorage.getItem('netease-api-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        primary: parsed.primary || DEFAULT_API_BASE,
        backup: parsed.backup || DEFAULT_API_BACKUP,
      };
    }
  } catch { /* ignore */ }
  return { primary: DEFAULT_API_BASE, backup: DEFAULT_API_BACKUP };
}

function saveApiSettings(primary: string, backup: string) {
  localStorage.setItem('netease-api-settings', JSON.stringify({ primary, backup }));
}

export default function MusicPlayer() {
  const [apiSettings, setApiSettings] = useState(loadApiSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [editPrimary, setEditPrimary] = useState(apiSettings.primary);
  const [editBackup, setEditBackup] = useState(apiSettings.backup);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const [playlist, setPlaylist] = useState<Song[]>(FALLBACK_PLAYLIST);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set<number>([0, 2]));
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const API_BASE = apiSettings.primary;
  const API_BACKUP = apiSettings.backup;

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      handleNext();
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || playlist[current]?.duration || 0);
    };

    const handleError = () => {
      console.error('Audio playback error');
      setApiError('音频加载失败，请尝试切换歌曲');
      setPlaying(false);
      setTimeout(() => setApiError(null), 3000);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
    };
  }, [current, playlist]);

  // Update progress
  useEffect(() => {
    if (playing) {
      progressRef.current = setInterval(() => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || playlist[current]?.duration || 0);
        }
      }, 500);
    } else {
      if (progressRef.current) clearInterval(progressRef.current);
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [playing, current, playlist]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Test API connection
  const testApi = useCallback(async () => {
    setTestStatus('testing');
    try {
      const res = await fetch(`${editPrimary}/search?keywords=test&limit=1`, {
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  }, [editPrimary]);

  // Save API settings
  const handleSaveSettings = useCallback(() => {
    const primary = editPrimary.trim() || DEFAULT_API_BASE;
    const backup = editBackup.trim() || DEFAULT_API_BACKUP;
    setApiSettings({ primary, backup });
    saveApiSettings(primary, backup);
    setShowSettings(false);
    setApiError(null);
  }, [editPrimary, editBackup]);

  // Reset to defaults
  const handleResetSettings = useCallback(() => {
    setEditPrimary(DEFAULT_API_BASE);
    setEditBackup(DEFAULT_API_BACKUP);
    setApiSettings({ primary: DEFAULT_API_BASE, backup: DEFAULT_API_BACKUP });
    saveApiSettings(DEFAULT_API_BASE, DEFAULT_API_BACKUP);
  }, []);

  // Fetch song URL and play
  const playSong = useCallback(async (song: Song, index: number) => {
    setApiError(null);
    setCurrent(index);
    setProgress(0);

    try {
      let res = await fetch(`${API_BASE}/song/url?id=${song.id}&br=320000`, { signal: AbortSignal.timeout(8000) }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${API_BACKUP}/song/url?id=${song.id}&br=320000`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
      }

      if (!res || !res.ok) {
        setApiError(`无法获取歌曲播放链接\n当前 API: ${API_BASE}`);
        setTimeout(() => setApiError(null), 4000);
        setPlaying(true);
        setDuration(song.duration);
        return;
      }

      const data = await res.json();
      const url = data.data?.[0]?.url;

      if (!url) {
        setApiError('该歌曲暂无播放资源 (版权限制)');
        setTimeout(() => setApiError(null), 3000);
        setDuration(song.duration);
        setPlaying(true);
        return;
      }

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.currentTime = 0;
        try {
          await audioRef.current.play();
          setPlaying(true);
        } catch {
          setPlaying(false);
        }
      }
    } catch {
      setApiError('网络请求失败，请检查网络连接或更换 API');
      setTimeout(() => setApiError(null), 4000);
      setDuration(song.duration);
    }
  }, [API_BASE, API_BACKUP]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current?.src) {
      playSong(playlist[current], current);
      return;
    }

    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      audioRef.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [playing, current, playlist, playSong]);

  const handleNext = useCallback(() => {
    const next = (current + 1) % playlist.length;
    playSong(playlist[next], next);
  }, [current, playlist, playSong]);

  const handlePrev = useCallback(() => {
    const prev = (current - 1 + playlist.length) % playlist.length;
    playSong(playlist[prev], prev);
  }, [current, playlist, playSong]);

  // Search songs
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setApiError(null);

    try {
      let res = await fetch(`${API_BASE}/search?keywords=${encodeURIComponent(searchQuery)}&limit=20&type=1`, {
        signal: AbortSignal.timeout(8000)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${API_BACKUP}/search?keywords=${encodeURIComponent(searchQuery)}&limit=20&type=1`, {
          signal: AbortSignal.timeout(8000)
        }).catch(() => null);
      }

      if (!res || !res.ok) {
        setApiError(`搜索服务暂时不可用\n当前 API: ${API_BASE}`);
        setSearchResults([]);
        setSearching(false);
        return;
      }

      const data = await res.json();
      const songs = data.result?.songs || [];
      setSearchResults(songs);
    } catch {
      setApiError('搜索失败，请检查网络连接或更换 API');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, API_BASE, API_BACKUP]);

  // Add search result to playlist
  const addToPlaylist = useCallback((result: SearchResult) => {
    const newSong: Song = {
      id: result.id,
      title: result.name,
      artist: result.artists.map(a => a.name).join(' / '),
      album: result.album.name,
      duration: Math.floor(result.duration / 1000),
      picUrl: result.album.picUrl,
    };

    setPlaylist(prev => {
      if (prev.some(s => s.id === newSong.id)) return prev;
      return [...prev, newSong];
    });

    const newIndex = playlist.length;
    playSong(newSong, newIndex);
    setShowSearch(false);
  }, [playlist, playSong]);

  // Toggle like
  const toggleLike = useCallback((i: number) => {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }, []);

  // Format time
  const formatTime = useCallback((s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }, []);

  // Handle progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * (duration || playlist[current]?.duration || 0);

    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = newTime;
    }
    setProgress(newTime);
  }, [duration, current, playlist]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleNext, handlePrev]);

  const currentSong = playlist[current];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      {/* Top Bar - Search & Settings */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <button
          onClick={() => { setShowSearch(!showSearch); setShowSettings(false); }}
          className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-cyan-400/20 text-cyan-400' : 'hover:bg-white/5 text-muted-foreground'}`}
        >
          <Search size={16} />
        </button>

        {showSearch && (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="搜索歌曲、歌手..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-cyan-400/50 transition-colors"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-3 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              搜索
            </button>
          </div>
        )}

        {!showSearch && !showSettings && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-1">
            <Disc3 size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>网易云音乐 Web 版</span>
          </div>
        )}

        {/* Settings Button */}
        {!showSearch && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-cyan-400/20 text-cyan-400' : 'hover:bg-white/5 text-muted-foreground'}`}
            title="API 设置"
          >
            <Settings size={16} />
          </button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mx-4 mt-2 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">API 设置</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded hover:bg-white/10 transition-colors text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            如果默认 API 无法使用，可以更换为其他网易云 API 镜像地址。
            <a
              href="https://github.com/Binaryify/NeteaseCloudMusicApi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-0.5 ml-1"
            >
              查看文档 <ExternalLink size={10} />
            </a>
          </div>

          {/* Primary API */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">主 API 地址</label>
            <input
              type="text"
              value={editPrimary}
              onChange={e => setEditPrimary(e.target.value)}
              placeholder={DEFAULT_API_BASE}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>

          {/* Backup API */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">备用 API 地址</label>
            <input
              type="text"
              value={editBackup}
              onChange={e => setEditBackup(e.target.value)}
              placeholder={DEFAULT_API_BACKUP}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>

          {/* Current API info */}
          <div className="text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2">
            <div>当前主 API: <span className="text-cyan-400">{API_BASE}</span></div>
            <div>当前备用: <span className="text-cyan-400">{API_BACKUP}</span></div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors"
            >
              <Save size={12} /> 保存设置
            </button>
            <button
              onClick={testApi}
              disabled={testStatus === 'testing'}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50 ${
                testStatus === 'success' ? 'bg-green-500/20 text-green-400' :
                testStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-white/10 text-muted-foreground hover:bg-white/20'
              }`}
            >
              {testStatus === 'testing' ? <Loader2 size={12} className="animate-spin" /> :
               testStatus === 'success' ? <Check size={12} /> :
               testStatus === 'error' ? <AlertCircle size={12} /> :
               <ExternalLink size={12} />}
              {testStatus === 'testing' ? '测试中...' :
               testStatus === 'success' ? '连接正常' :
               testStatus === 'error' ? '连接失败' :
               '测试连接'}
            </button>
            <button
              onClick={handleResetSettings}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-muted-foreground text-xs hover:bg-white/10 transition-colors ml-auto"
            >
              <RotateCcw size={12} /> 恢复默认
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {apiError && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-in whitespace-pre-line">
          <AlertCircle size={14} />
          <span>{apiError}</span>
        </div>
      )}

      {/* Search Results */}
      {showSearch && searchResults.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <TrendingUp size={12} />
            搜索结果 ({searchResults.length})
          </div>
          {searchResults.map((song) => (
            <button
              key={song.id}
              onClick={() => addToPlaylist(song)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #C20C0C40, #7B2CBF40)' }}>
                {song.album.picUrl ? (
                  <img src={song.album.picUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ListMusic size={16} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{song.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {song.artists.map(a => a.name).join(' / ')} - {song.album.name}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{formatTime(Math.floor(song.duration / 1000))}</span>
              <Play size={14} className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}

      {showSearch && searchResults.length === 0 && !searching && searchQuery && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          未找到相关歌曲
        </div>
      )}

      {showSearch && !searchQuery && (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <Search size={32} />
          <div className="text-sm">输入关键词搜索歌曲</div>
          <div className="text-xs">支持歌名、歌手搜索</div>
        </div>
      )}

      {/* Main Player View */}
      {!showSearch && !showSettings && (
        <>
          {/* Album Art */}
          <div className="flex-shrink-0 p-6 flex flex-col items-center">
            <div
              className="w-40 h-40 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #C20C0C40, #7B2CBF40)' }}
            >
              {currentSong?.picUrl ? (
                <img src={currentSong.picUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <ListMusic size={48} className="text-muted-foreground" />
              )}
              {playing && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="font-medium text-lg">{currentSong?.title || '未播放'}</div>
              <div className="text-sm text-muted-foreground">{currentSong?.artist || '-'}</div>
            </div>
          </div>

          {/* Progress */}
          <div className="px-6 mb-2">
            <div
              className="w-full h-1 bg-white/10 rounded-full cursor-pointer relative group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-cyan-400 rounded-full transition-all relative"
                style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration || currentSong?.duration || 0)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 px-6 mb-3">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <Shuffle size={16} className="text-muted-foreground" />
            </button>
            <button onClick={handlePrev} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <SkipBack size={20} />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 transition-colors"
            >
              {playing ? (
                <Pause size={24} className="text-cyan-400" />
              ) : (
                <Play size={24} className="text-cyan-400 ml-0.5" />
              )}
            </button>
            <button onClick={handleNext} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <SkipForward size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <Repeat size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 px-6 mb-3">
            <button onClick={() => setMuted(!muted)} className="text-muted-foreground hover:text-white transition-colors">
              {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div
              className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                setVolume(Math.max(0, Math.min(1, ratio)));
                setMuted(false);
              }}
            >
              <div
                className="h-full bg-white/30 rounded-full relative"
                style={{ width: `${muted ? 0 : volume * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground w-8 text-right">{Math.round((muted ? 0 : volume) * 100)}%</span>
          </div>

          {/* Playlist */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2 px-3">
              <Clock size={12} />
              <span>播放列表 ({playlist.length})</span>
            </div>
            {playlist.map((song, i) => (
              <button
                key={`${song.id}-${i}`}
                onClick={() => playSong(song, i)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                style={{ background: i === current ? 'rgba(0, 180, 216, 0.1)' : 'transparent' }}
              >
                <span className="text-xs text-muted-foreground w-5">
                  {i === current && playing ? (
                    <span className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 bg-cyan-400 animate-pulse" style={{ height: '60%', animationDelay: '0ms' }} />
                      <span className="w-0.5 bg-cyan-400 animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
                      <span className="w-0.5 bg-cyan-400 animate-pulse" style={{ height: '40%', animationDelay: '300ms' }} />
                    </span>
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${i === current ? 'text-cyan-400' : ''}`}>{song.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
                </div>
                <span className="text-xs text-muted-foreground">{formatTime(song.duration)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(i); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart size={14} className={liked.has(i) ? 'text-red-400' : 'text-muted-foreground'} />
                </button>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
