import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart,
  ListMusic, Search, Loader2, Volume2, VolumeX, TrendingUp, Clock,
  AlertCircle, Disc3, Settings, X, Save, RotateCcw, Check, ExternalLink,
  Music, Upload, Radio
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
  isLocal?: boolean;
  localUrl?: string;
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

// 本地合成器播放列表 —— 不依赖任何外部API，听个响
const LOCAL_PLAYLIST: Song[] = [
  { id: -1, title: '小星星', artist: '本地合成器', album: '内置音效', duration: 28 },
  { id: -2, title: '卡农片段', artist: '本地合成器', album: '内置音效', duration: 40 },
  { id: -3, title: '电子节拍', artist: '本地合成器', album: '内置音效', duration: 32 },
  { id: -4, title: '正弦扫频', artist: '本地合成器', album: '内置音效', duration: 10 },
  { id: -5, title: '粉红噪音', artist: '本地合成器', album: '内置音效', duration: 60 },
  { id: -6, title: '8-Bit 冒险', artist: '本地合成器', album: '内置音效', duration: 24 },
];

// 音符频率表 (C4 - B4)
const NOTE_FREQ: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  rest: 0,
};

// 旋律数据
const MELODIES: Record<number, { note: string; duration: number; type?: OscillatorType }[]> = {
  // 小星星
  [-1]: [
    { note: 'C4', duration: 0.5 }, { note: 'C4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 }, { note: 'A4', duration: 0.5 }, { note: 'G4', duration: 1.0 },
    { note: 'F4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
    { note: 'D4', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'C4', duration: 1.0 },
    { note: 'G4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'F4', duration: 0.5 },
    { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 1.0 },
    { note: 'G4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'F4', duration: 0.5 },
    { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 1.0 },
    { note: 'C4', duration: 0.5 }, { note: 'C4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 }, { note: 'A4', duration: 0.5 }, { note: 'G4', duration: 1.0 },
    { note: 'F4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
    { note: 'D4', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'C4', duration: 1.5 },
  ],
  // 卡农片段
  [-2]: [
    { note: 'C4', duration: 0.4 }, { note: 'E4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'C5', duration: 0.4 },
    { note: 'G4', duration: 0.4 }, { note: 'E4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'D4', duration: 0.4 },
    { note: 'F4', duration: 0.4 }, { note: 'A4', duration: 0.4 }, { note: 'C5', duration: 0.4 }, { note: 'A4', duration: 0.4 },
    { note: 'F4', duration: 0.4 }, { note: 'A4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'E4', duration: 0.4 },
    { note: 'C4', duration: 0.4 }, { note: 'E4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'C5', duration: 0.4 },
    { note: 'E5', duration: 0.4 }, { note: 'D5', duration: 0.4 }, { note: 'C5', duration: 0.4 }, { note: 'B4', duration: 0.4 },
    { note: 'C4', duration: 0.4 }, { note: 'E4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'C5', duration: 0.4 },
    { note: 'G4', duration: 0.4 }, { note: 'E4', duration: 0.4 }, { note: 'C4', duration: 0.8 },
  ],
  // 电子节拍
  [-3]: [
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'G3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'G3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'G3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'G3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
    { note: 'C3', duration: 0.2, type: 'square' }, { note: 'rest', duration: 0.1 },
  ],
  // 8-Bit 冒险
  [-6]: [
    { note: 'E4', duration: 0.15, type: 'square' }, { note: 'G4', duration: 0.15, type: 'square' },
    { note: 'A4', duration: 0.15, type: 'square' }, { note: 'B4', duration: 0.3, type: 'square' },
    { note: 'A4', duration: 0.15, type: 'square' }, { note: 'G4', duration: 0.15, type: 'square' },
    { note: 'E4', duration: 0.3, type: 'square' },
    { note: 'D4', duration: 0.15, type: 'square' }, { note: 'E4', duration: 0.15, type: 'square' },
    { note: 'G4', duration: 0.15, type: 'square' }, { note: 'E4', duration: 0.3, type: 'square' },
    { note: 'D4', duration: 0.15, type: 'square' }, { note: 'C4', duration: 0.15, type: 'square' },
    { note: 'D4', duration: 0.3, type: 'square' },
    { note: 'E4', duration: 0.15, type: 'square' }, { note: 'G4', duration: 0.15, type: 'square' },
    { note: 'A4', duration: 0.15, type: 'square' }, { note: 'B4', duration: 0.3, type: 'square' },
    { note: 'A4', duration: 0.15, type: 'square' }, { note: 'G4', duration: 0.15, type: 'square' },
    { note: 'E4', duration: 0.3, type: 'square' },
    { note: 'D4', duration: 0.15, type: 'square' }, { note: 'E4', duration: 0.15, type: 'square' },
    { note: 'G4', duration: 0.15, type: 'square' }, { note: 'E4', duration: 0.3, type: 'square' },
    { note: 'D4', duration: 0.15, type: 'square' }, { note: 'C4', duration: 0.15, type: 'square' },
    { note: 'C4', duration: 0.6, type: 'square' },
  ],
};

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

  // mode: 'netease' | 'local'
  const [mode, setMode] = useState<'netease' | 'local'>(() => {
    try { return localStorage.getItem('music-player-mode') as 'netease' | 'local' || 'netease'; }
    catch { return 'netease'; }
  });

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

  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const localOscRef = useRef<OscillatorNode | null>(null);
  const localGainRef = useRef<GainNode | null>(null);
  const localTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const localStartTimeRef = useRef<number>(0);

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
      stopLocalAudio();
    };
  }, []);

  // Handle audio events (netease mode)
  useEffect(() => {
    if (mode !== 'netease') return;
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => { handleNext(); };
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
  }, [current, playlist, mode]);

  // Update progress (netease mode)
  useEffect(() => {
    if (mode !== 'netease') return;
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
  }, [playing, current, playlist, mode]);

  // Local mode progress updater
  useEffect(() => {
    if (mode !== 'local') return;
    if (playing) {
      progressRef.current = setInterval(() => {
        const elapsed = (Date.now() - localStartTimeRef.current) / 1000;
        const dur = playlist[current]?.duration || 0;
        setProgress(Math.min(elapsed, dur));
        setDuration(dur);
        if (elapsed >= dur) {
          handleNext();
        }
      }, 500);
    } else {
      if (progressRef.current) clearInterval(progressRef.current);
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [playing, current, playlist, mode]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
    if (localGainRef.current && audioCtxRef.current) {
      localGainRef.current.gain.setValueAtTime(muted ? 0 : volume * 0.3, audioCtxRef.current.currentTime);
    }
  }, [volume, muted]);

  // Save mode
  useEffect(() => {
    localStorage.setItem('music-player-mode', mode);
  }, [mode]);

  // Switch mode -> reset playlist
  const handleSwitchMode = useCallback((newMode: 'netease' | 'local') => {
    setPlaying(false);
    setProgress(0);
    setApiError(null);
    stopLocalAudio();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setMode(newMode);
    if (newMode === 'local') {
      setPlaylist(LOCAL_PLAYLIST);
    } else {
      setPlaylist(FALLBACK_PLAYLIST);
    }
    setCurrent(0);
  }, []);

  // Stop local audio
  const stopLocalAudio = useCallback(() => {
    localTimeoutRef.current.forEach(t => clearTimeout(t));
    localTimeoutRef.current = [];
    if (localOscRef.current) {
      try { localOscRef.current.stop(); } catch { /* ignore */ }
      localOscRef.current = null;
    }
    if (localGainRef.current) {
      try { localGainRef.current.disconnect(); } catch { /* ignore */ }
      localGainRef.current = null;
    }
  }, []);

  // Play local song using Web Audio API
  const playLocalSong = useCallback((song: Song, index: number) => {
    stopLocalAudio();
    setCurrent(index);
    setProgress(0);
    localStartTimeRef.current = Date.now();

    const songId = song.id;

    // 正弦扫频
    if (songId === -4) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 10);
      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 10);
      osc.start();
      osc.stop(ctx.currentTime + 10);
      localOscRef.current = osc;
      localGainRef.current = gain;
      setPlaying(true);
      const t = setTimeout(() => { setPlaying(false); setProgress(10); }, 10000);
      localTimeoutRef.current.push(t);
      return;
    }

    // 粉红噪音
    if (songId === -5) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      noise.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
      noise.loop = true;
      noise.start();
      localOscRef.current = noise as any;
      localGainRef.current = gain;
      setPlaying(true);
      return;
    }

    // 旋律播放
    const melody = MELODIES[songId];
    if (!melody || melody.length === 0) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    let time = ctx.currentTime + 0.1;

    melody.forEach(({ note, duration, type }) => {
      const freq = NOTE_FREQ[note] || 0;
      if (freq === 0) {
        time += duration;
        return;
      }
      const t = setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type || 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration - 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      }, (time - ctx.currentTime) * 1000);
      localTimeoutRef.current.push(t);
      time += duration;
    });

    setPlaying(true);
    const endT = setTimeout(() => { setPlaying(false); }, (time - ctx.currentTime) * 1000);
    localTimeoutRef.current.push(endT);
  }, [volume, stopLocalAudio]);

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

  // Fetch song URL and play (netease mode)
  const playSong = useCallback(async (song: Song, index: number) => {
    if (mode === 'local') {
      playLocalSong(song, index);
      return;
    }

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
  }, [API_BASE, API_BACKUP, mode, playLocalSong]);

  const togglePlay = useCallback(() => {
    if (mode === 'local') {
      if (playing) {
        stopLocalAudio();
        setPlaying(false);
      } else {
        playLocalSong(playlist[current], current);
      }
      return;
    }

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
  }, [playing, current, playlist, playSong, mode, playLocalSong, stopLocalAudio]);

  const handleNext = useCallback(() => {
    const next = (current + 1) % playlist.length;
    playSong(playlist[next], next);
  }, [current, playlist, playSong]);

  const handlePrev = useCallback(() => {
    const prev = (current - 1 + playlist.length) % playlist.length;
    playSong(playlist[prev], prev);
  }, [current, playlist, playSong]);

  // Search songs (netease only)
  const handleSearch = useCallback(async () => {
    if (mode !== 'netease') return;
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
  }, [searchQuery, API_BASE, API_BACKUP, mode]);

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
  }, []);

  // Handle file upload (local mode)
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('audio/')) return;
      const url = URL.createObjectURL(file);
      const newSong: Song = {
        id: Date.now() + Math.random(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: '本地文件',
        album: '上传音乐',
        duration: 0,
        isLocal: true,
        localUrl: url,
      };
      // 获取音频时长
      const tempAudio = new Audio(url);
      tempAudio.addEventListener('loadedmetadata', () => {
        newSong.duration = Math.floor(tempAudio.duration);
        setPlaylist(prev => [...prev, newSong]);
      });
      tempAudio.addEventListener('error', () => {
        setPlaylist(prev => [...prev, newSong]);
      });
    });

    e.target.value = '';
  }, []);

  // Play uploaded local file
  const playUploadedFile = useCallback((song: Song, index: number) => {
    if (!song.localUrl) return;
    stopLocalAudio();
    if (audioRef.current) {
      audioRef.current.src = song.localUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        setPlaying(true);
        setCurrent(index);
        setProgress(0);
      }).catch(() => setPlaying(false));
    }
  }, [stopLocalAudio]);

  // Override playSong for uploaded files
  const handlePlaySong = useCallback((song: Song, index: number) => {
    if (song.isLocal && song.localUrl) {
      playUploadedFile(song, index);
      return;
    }
    playSong(song, index);
  }, [playSong, playUploadedFile]);

  // Seek (netease only)
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (mode === 'netease' && audioRef.current) {
      audioRef.current.currentTime = val;
      setProgress(val);
    }
  }, [mode]);

  // Format time
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Current song
  const song = playlist[current] || playlist[0];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white select-none overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">音乐播放器</span>
          {mode === 'local' && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">本地模式</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => handleSwitchMode('netease')}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${mode === 'netease' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/50 hover:text-white'}`}
            >
              网易云
            </button>
            <button
              onClick={() => handleSwitchMode('local')}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${mode === 'local' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/50 hover:text-white'}`}
            >
              本地
            </button>
          </div>

          {mode === 'netease' && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-1.5 rounded-lg transition-colors ${showSearch ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-white/60'}`}
            >
              <Search className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* API Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/60">API 设置</span>
            <button onClick={handleResetSettings} className="text-[10px] text-white/40 hover:text-white/70 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> 恢复默认
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-white/40 block mb-1">主 API</label>
              <div className="flex gap-2">
                <input
                  value={editPrimary}
                  onChange={e => setEditPrimary(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-emerald-500/50"
                  placeholder={DEFAULT_API_BASE}
                />
                <button
                  onClick={testApi}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white/60 hover:bg-white/10 transition-colors"
                >
                  {testStatus === 'testing' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                   testStatus === 'success' ? <Check className="w-3 h-3 text-emerald-400" /> :
                   testStatus === 'error' ? <AlertCircle className="w-3 h-3 text-red-400" /> : '测试'}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1">备用 API</label>
              <input
                value={editBackup}
                onChange={e => setEditBackup(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-emerald-500/50"
                placeholder={DEFAULT_API_BACKUP}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveSettings}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500/20 text-emerald-400 rounded text-xs hover:bg-emerald-500/30 transition-colors"
              >
                <Save className="w-3 h-3" /> 保存
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-1.5 bg-white/5 text-white/60 rounded text-xs hover:bg-white/10 transition-colors"
              >
                取消
              </button>
            </div>
            <p className="text-[10px] text-white/30">
              提示：公开 API 经常失效，建议自行部署。有服务器用 Docker 跑一个最稳。
              <a href="https://github.com/Binaryify/NeteaseCloudMusicApi" target="_blank" rel="noopener" className="text-emerald-400/60 hover:text-emerald-400 inline-flex items-center gap-0.5">
                查看部署文档 <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Search Panel (netease only) */}
      {showSearch && mode === 'netease' && (
        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-2 mb-2">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="搜索歌曲、歌手..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : '搜索'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {searchResults.map(r => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer group" onClick={() => addToPlaylist(r)}>
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                    <Music className="w-4 h-4 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/80 truncate">{r.name}</div>
                    <div className="text-[10px] text-white/40 truncate">{r.artists.map(a => a.name).join(' / ')} - {r.album.name}</div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1 text-emerald-400 hover:bg-emerald-500/10 rounded transition-all">
                    <ListMusic className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Local mode upload */}
      {mode === 'local' && (
        <div className="px-4 py-2 border-b border-white/5">
          <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 border-dashed rounded-lg cursor-pointer hover:bg-white/[0.07] transition-colors">
            <Upload className="w-4 h-4 text-white/40" />
            <span className="text-xs text-white/50">点击上传本地音频文件（支持多选）</span>
            <input type="file" accept="audio/*" multiple className="hidden" onChange={handleFileUpload} />
          </label>
          <p className="text-[10px] text-white/30 mt-1.5">
            内置 6 首合成器音效，不依赖任何外部 API。也可以上传自己的音乐文件。
          </p>
        </div>
      )}

      {/* Playlist */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-0.5">
          {playlist.map((s, i) => (
            <div
              key={`${s.id}-${i}`}
              onClick={() => handlePlaySong(s, i)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                i === current ? 'bg-emerald-500/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-8 text-center text-xs text-white/30 font-mono">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm truncate ${i === current ? 'text-emerald-400' : 'text-white/80'}`}>
                  {s.title}
                  {s.isLocal && <span className="ml-1 text-[10px] text-emerald-400/60">[本地]</span>}
                </div>
                <div className="text-xs text-white/40 truncate">{s.artist} - {s.album}</div>
              </div>
              <div className="text-xs text-white/30 font-mono">{fmt(s.duration)}</div>
              {i === current && playing && (
                <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 bg-emerald-400 animate-[music-bar_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
                  <div className="w-0.5 bg-emerald-400 animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ height: '100%' }} />
                  <div className="w-0.5 bg-emerald-400 animate-[music-bar_0.5s_ease-in-out_infinite]" style={{ height: '40%' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error toast */}
      {apiError && (
        <div className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-red-300 whitespace-pre-line">{apiError}</div>
        </div>
      )}

      {/* Player controls */}
      <div className="border-t border-white/5 px-4 py-3 bg-white/[0.02]">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] text-white/40 font-mono w-8 text-right">{fmt(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={Math.min(progress, duration || 0)}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-[10px] text-white/40 font-mono w-8">{fmt(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-white/40 hover:text-white/70 transition-colors">
              <Heart className={`w-4 h-4 ${liked.has(current) ? 'fill-red-400 text-red-400' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-1.5 text-white/40 hover:text-white/70 transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={handlePrev} className="p-1.5 text-white/60 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={handleNext} className="p-1.5 text-white/60 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
            <button className="p-1.5 text-white/40 hover:text-white/70 transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setMuted(!muted)} className="p-1.5 text-white/40 hover:text-white/70 transition-colors">
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white/60 [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>
        </div>

        {/* Current song info */}
        <div className="mt-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
            {song?.picUrl ? (
              <img src={song.picUrl} alt="" className="w-full h-full rounded-lg object-cover" />
            ) : (
              <Music className="w-5 h-5 text-white/20" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/90 truncate">{song?.title || '未播放'}</div>
            <div className="text-xs text-white/40 truncate">{song?.artist || '选择一首歌曲'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
