import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart,
  ListMusic, Search, Loader2, Volume2, VolumeX, TrendingUp, Clock,
  AlertCircle, Disc3, Settings, X, Save, RotateCcw, Check, ExternalLink,
  Music, Upload, Radio
} from 'lucide-react';

type Platform = 'netease' | 'qq' | 'kugou' | 'bilibili' | 'local';

interface PlatformApiConfig {
  primary: string;
  backup: string;
  docs: string;
}

const DEFAULT_APIS: Record<Platform, PlatformApiConfig> = {
  netease: {
    primary: 'https://api-mymusic.vercel.app',
    backup: 'https://netease-cloud-music-api-wine.vercel.app',
    docs: 'https://github.com/Binaryify/NeteaseCloudMusicApi',
  },
  qq: {
    primary: '',
    backup: '',
    docs: 'https://github.com/jsososo/QQMusicApi',
  },
  kugou: {
    primary: '',
    backup: '',
    docs: 'https://github.com/maicong/music',
  },
  bilibili: {
    primary: 'https://api.bilibili.com',
    backup: '',
    docs: 'https://github.com/SocialSisterYi/bilibili-API-collect',
  },
  local: {
    primary: '',
    backup: '',
    docs: '',
  },
};

interface Song {
  id: number | string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  picUrl?: string;
  isLocal?: boolean;
  localUrl?: string;
  bvid?: string;
}

interface SearchResult {
  id: number | string;
  name: string;
  artists: { name: string }[];
  album: { name: string; picUrl?: string };
  duration: number;
  bvid?: string;
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

function loadApiSettings(): Record<Platform, { primary: string; backup: string }> {
  try {
    const saved = localStorage.getItem('music-api-settings-v2');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {
    netease: { primary: DEFAULT_APIS.netease.primary, backup: DEFAULT_APIS.netease.backup },
    qq: { primary: '', backup: '' },
    kugou: { primary: '', backup: '' },
    bilibili: { primary: 'https://api.bilibili.com', backup: '' },
    local: { primary: '', backup: '' },
  };
}

function saveApiSettings(settings: Record<Platform, { primary: string; backup: string }>) {
  localStorage.setItem('music-api-settings-v2', JSON.stringify(settings));
}

interface MusicPlayerProps {
  defaultPlatform?: Platform;
}

export default function MusicPlayer({ defaultPlatform }: MusicPlayerProps = {}) {
  const [apiSettings, setApiSettings] = useState(loadApiSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [editPrimary, setEditPrimary] = useState('');
  const [editBackup, setEditBackup] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const [mode, setMode] = useState<Platform>(() => {
    try {
      const saved = localStorage.getItem('music-player-mode') as Platform;
      if (saved && DEFAULT_APIS[saved]) return saved;
    } catch { /* ignore */ }
    return defaultPlatform || 'netease';
  });

  const [playlist, setPlaylist] = useState<Song[]>(FALLBACK_PLAYLIST);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState<Set<number | string>>(new Set([0, 2]));
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef<HTMLDivElement | null>(null);

  // Local synthesizer refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const localIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [localProgress, setLocalProgress] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);

  // Handle audio events (online mode)
  useEffect(() => {
    if (mode === 'local') return;
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => { handleNext(); };
    const handleLoaded = () => { setDuration(audio.duration || 0); };
    const handleError = () => {
      setApiError('音频加载失败，可能链接失效或跨域限制');
      setTimeout(() => setApiError(null), 3000);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('error', handleError);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('error', handleError);
    };
  }, [current, playlist, mode]);

  // Update progress (online mode)
  useEffect(() => {
    if (mode === 'local') return;
    if (!playing || !audioRef.current) return;
    const interval = setInterval(() => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
        setDuration(audioRef.current.duration || 0);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [playing, current, playlist, mode]);

  // Local mode progress updater
  useEffect(() => {
    if (mode !== 'local') return;
    if (!playing) return;
    localIntervalRef.current = setInterval(() => {
      setLocalProgress(p => {
        if (p >= localDuration) {
          setPlaying(false);
          return 0;
        }
        return p + 0.5;
      });
    }, 500);
    return () => {
      if (localIntervalRef.current) clearInterval(localIntervalRef.current);
    };
  }, [playing, localDuration, mode]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted, current, mode]);

  // Save mode
  useEffect(() => {
    localStorage.setItem('music-player-mode', mode);
  }, [mode]);

  // Update edit inputs when mode or settings change
  useEffect(() => {
    setEditPrimary(apiSettings[mode].primary);
    setEditBackup(apiSettings[mode].backup);
    setTestStatus('idle');
  }, [mode, apiSettings, showSettings]);

  const handleSwitchMode = useCallback((newMode: Platform) => {
    setMode(newMode);
    setShowSearch(false);
    setSearchResults([]);
    setApiError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    stopLocalAudio();
    setPlaying(false);
    setProgress(0);
    setLocalProgress(0);
    if (newMode === 'local') {
      setPlaylist(LOCAL_PLAYLIST);
      setCurrent(0);
      setDuration(0);
      setLocalDuration(0);
    } else {
      setPlaylist(FALLBACK_PLAYLIST);
      setCurrent(0);
      setDuration(FALLBACK_PLAYLIST[0]?.duration || 0);
    }
  }, []);

  // Local synthesizer functions
  const playLocalSong = useCallback((song: Song, index: number) => {
    setCurrent(index);
    setPlaying(true);
    setLocalProgress(0);
    setLocalDuration(song.duration);

    if (song.isLocal && song.localUrl) {
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = song.localUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setPlaying(false));
      return;
    }

    const melody = MELODIES[song.id as number];
    if (!melody) return;

    stopLocalAudio();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    let time = 0;
    melody.forEach(({ note, duration, type = 'triangle' }) => {
      if (note === 'rest') {
        time += duration;
        return;
      }
      const freq = NOTE_FREQ[note];
      if (!freq) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
      oscillatorsRef.current.push(osc);
      gainNodesRef.current.push(gain);
      time += duration;
    });
  }, []);

  const stopLocalAudio = useCallback(() => {
    oscillatorsRef.current.forEach(o => { try { o.stop(); } catch {} });
    gainNodesRef.current.forEach(g => { try { g.disconnect(); } catch {} });
    oscillatorsRef.current = [];
    gainNodesRef.current = [];
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }
    if (localIntervalRef.current) { clearInterval(localIntervalRef.current); localIntervalRef.current = null; }
  }, []);

  const playNote = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', delay = 0) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
    oscillatorsRef.current.push(osc);
    gainNodesRef.current.push(gain);
  }, []);

  const playMelody = useCallback((notes: { note: string; duration: number; type?: OscillatorType }[], baseDelay = 0) => {
    let time = 0;
    notes.forEach(({ note, duration, type = 'triangle' }) => {
      if (note === 'rest') { time += duration; return; }
      const freq = NOTE_FREQ[note];
      if (freq) playNote(freq, duration, type, baseDelay + time);
      time += duration;
    });
  }, [playNote]);

  const playNoise = useCallback((duration: number, delay = 0) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime + delay);
    source.stop(ctx.currentTime + delay + duration);
  }, []);

  const playDrum = useCallback((freq: number, duration: number, delay = 0) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }, []);

  const play8Bit = useCallback((freq: number, duration: number, delay = 0) => {
    playNote(freq, duration, 'square', delay);
  }, [playNote]);

  const playSong = useCallback(async (song: Song, index: number) => {
    if (mode === 'local') {
      playLocalSong(song, index);
      return;
    }

    setApiError(null);
    setCurrent(index);
    setProgress(0);

    const apiBase = apiSettings[mode].primary;
    const apiBackup = apiSettings[mode].backup;

    if (!apiBase && !apiBackup) {
      const names: Record<Platform, string> = {
        netease: '网易云', qq: 'QQ音乐', kugou: '酷狗', bilibili: 'B站', local: '本地',
      };
      setApiError(`请先配置 ${names[mode]} API 地址`);
      setTimeout(() => setApiError(null), 4000);
      setPlaying(true);
      setDuration(song.duration);
      return;
    }

    try {
      let url: string | null = null;

      if (mode === 'netease') {
        let res = await fetch(`${apiBase}/song/url?id=${song.id}&br=320000`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
        if ((!res || !res.ok) && apiBackup) {
          res = await fetch(`${apiBackup}/song/url?id=${song.id}&br=320000`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json();
          url = data.data?.[0]?.url || null;
        }
      } else if (mode === 'qq') {
        let res = await fetch(`${apiBase}/song/url?id=${song.id}`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
        if ((!res || !res.ok) && apiBackup) {
          res = await fetch(`${apiBackup}/song/url?id=${song.id}`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json();
          url = data.data || null;
        }
      } else if (mode === 'kugou') {
        setApiError('酷狗 API 需自行部署，格式参考项目文档');
        setTimeout(() => setApiError(null), 4000);
      } else if (mode === 'bilibili') {
        if (song.bvid) {
          setApiError('B站模式暂支持视频搜索，播放需配合解析服务');
          setTimeout(() => setApiError(null), 4000);
        }
      }

      if (!url && mode !== 'kugou' && mode !== 'bilibili') {
        setApiError('无法获取歌曲播放链接，请检查API配置');
        setTimeout(() => setApiError(null), 4000);
        setDuration(song.duration);
        setPlaying(true);
        return;
      }

      if (url && audioRef.current) {
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
  }, [apiSettings, mode, playLocalSong]);

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

  // Search songs
  const handleSearch = useCallback(async () => {
    if (mode === 'local') return;
    if (!searchQuery.trim()) return;
    setSearching(true);
    setApiError(null);

    const apiBase = apiSettings[mode].primary;
    const apiBackup = apiSettings[mode].backup;

    if (!apiBase && !apiBackup) {
      const names: Record<Platform, string> = {
        netease: '网易云', qq: 'QQ音乐', kugou: '酷狗', bilibili: 'B站', local: '本地',
      };
      setApiError(`请先配置 ${names[mode]} API 地址`);
      setSearchResults([]);
      setSearching(false);
      return;
    }

    try {
      let songs: SearchResult[] = [];

      if (mode === 'netease') {
        let res = await fetch(`${apiBase}/search?keywords=${encodeURIComponent(searchQuery)}&limit=20&type=1`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
        if ((!res || !res.ok) && apiBackup) {
          res = await fetch(`${apiBackup}/search?keywords=${encodeURIComponent(searchQuery)}&limit=20&type=1`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json();
          songs = (data.result?.songs || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            artists: s.ar?.map((a: any) => ({ name: a.name })) || s.artists?.map((a: any) => ({ name: a.name })) || [],
            album: { name: s.al?.name || s.album?.name || '', picUrl: s.al?.picUrl || s.album?.picUrl },
            duration: Math.floor((s.dt || s.duration || 0) / 1000),
          }));
        }
      } else if (mode === 'qq') {
        let res = await fetch(`${apiBase}/search?key=${encodeURIComponent(searchQuery)}`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
        if ((!res || !res.ok) && apiBackup) {
          res = await fetch(`${apiBackup}/search?key=${encodeURIComponent(searchQuery)}`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json();
          songs = (data.data?.list || []).map((s: any) => ({
            id: s.songmid || s.mid,
            name: s.songname || s.name,
            artists: (s.singer || []).map((a: any) => ({ name: a.name })),
            album: { name: s.albumname || s.album?.name || '', picUrl: undefined },
            duration: s.interval || 0,
          }));
        }
      } else if (mode === 'kugou') {
        setApiError('酷狗搜索 API 需自行部署');
      } else if (mode === 'bilibili') {
        let res = await fetch(`https://api.bilibili.com/x/web-interface/search/type?keyword=${encodeURIComponent(searchQuery)}&search_type=video`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          songs = (data.data?.result || []).map((s: any) => ({
            id: s.bvid,
            name: s.title?.replace(/<[^>]+>/g, '') || '未知标题',
            artists: [{ name: s.author || 'UP主' }],
            album: { name: 'B站视频', picUrl: s.pic },
            duration: s.duration ? (() => {
              const parts = s.duration.split(':');
              return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            })() : 0,
            bvid: s.bvid,
          }));
        }
      }

      if (songs.length === 0 && !apiError) {
        setApiError('搜索无结果，请检查API配置或关键词');
      }
      setSearchResults(songs);
    } catch {
      setApiError('搜索失败，请检查网络连接或更换 API');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, apiSettings, mode]);

  const addToPlaylist = useCallback((result: SearchResult) => {
    const newSong: Song = {
      id: result.id,
      title: result.name,
      artist: result.artists.map(a => a.name).join(' / '),
      album: result.album.name,
      duration: result.duration,
      picUrl: result.album.picUrl,
      bvid: result.bvid,
    };
    setPlaylist(prev => {
      if (prev.some(s => s.id === newSong.id)) return prev;
      return [...prev, newSong];
    });
  }, []);

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

  const testApi = useCallback(async () => {
    if (mode === 'local') return;
    setTestStatus('testing');
    const base = editPrimary || apiSettings[mode].primary;
    if (!base) { setTestStatus('error'); return; }
    try {
      let endpoint = '';
      if (mode === 'netease') endpoint = base + '/search?keywords=test&limit=1';
      else if (mode === 'qq') endpoint = base + '/search?key=test';
      else if (mode === 'kugou') endpoint = base + '/search?keyword=test';
      else if (mode === 'bilibili') endpoint = 'https://api.bilibili.com/x/web-interface/search/type?keyword=test&search_type=video';
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
      setTestStatus(res.ok ? 'success' : 'error');
    } catch {
      setTestStatus('error');
    }
  }, [editPrimary, apiSettings, mode]);

  const handleSaveSettings = useCallback(() => {
    const updated = { ...apiSettings, [mode]: { primary: editPrimary, backup: editBackup } };
    setApiSettings(updated);
    saveApiSettings(updated);
    setShowSettings(false);
    setTestStatus('idle');
  }, [editPrimary, editBackup, apiSettings, mode]);

  const handleResetSettings = useCallback(() => {
    const defaults = {
      netease: { primary: DEFAULT_APIS.netease.primary, backup: DEFAULT_APIS.netease.backup },
      qq: { primary: '', backup: '' },
      kugou: { primary: '', backup: '' },
      bilibili: { primary: 'https://api.bilibili.com', backup: '' },
      local: { primary: '', backup: '' },
    };
    setApiSettings(defaults);
    saveApiSettings(defaults);
    setEditPrimary(defaults[mode].primary);
    setEditBackup(defaults[mode].backup);
    setTestStatus('idle');
  }, [mode]);

  const formatTime = (s: number) => {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const platformNames: Record<Platform, string> = {
    netease: '网易云', qq: 'QQ音乐', kugou: '酷狗', bilibili: 'B站', local: '本地',
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white select-none overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">音乐播放器</span>
          {mode !== 'netease' && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
              {platformNames[mode]}模式
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5">
            {(['netease', 'qq', 'kugou', 'bilibili', 'local'] as Platform[]).map(p => (
              <button
                key={p}
                onClick={() => handleSwitchMode(p)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${mode === p ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/50 hover:text-white'}`}
              >
                {platformNames[p]}
              </button>
            ))}
          </div>

          {mode !== 'local' && (
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
            <span className="text-xs font-medium text-white/60">
              {platformNames[mode]} API 设置
            </span>
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
                  placeholder={DEFAULT_APIS[mode].primary || '请输入API地址'}
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
                placeholder={DEFAULT_APIS[mode].backup || '可选'}
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
            {mode !== 'local' && DEFAULT_APIS[mode].docs && (
              <p className="text-[10px] text-white/30">
                提示：公开 API 经常失效，建议自行部署。
                <a href={DEFAULT_APIS[mode].docs} target="_blank" rel="noopener" className="text-emerald-400/60 hover:text-emerald-400 inline-flex items-center gap-0.5">
                  查看部署文档 <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Search Panel */}
      {showSearch && mode !== 'local' && (
        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-2 mb-2">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={`在${platformNames[mode]}搜索...`}
              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded text-xs hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : '搜索'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {searchResults.map((result, idx) => (
                <div
                  key={`${result.id}-${idx}`}
                  onClick={() => addToPlaylist(result)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/80 truncate">{result.name}</div>
                    <div className="text-[10px] text-white/40 truncate">{result.artists.map(a => a.name).join(' / ')} · {result.album.name}</div>
                  </div>
                  <div className="text-[10px] text-white/30 shrink-0">{formatTime(result.duration)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Playlist */}
        <div className={`${showPlaylist ? 'w-64' : 'w-0'} border-r border-white/5 flex flex-col transition-all duration-200`}>
          {showPlaylist && (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                <span className="text-xs font-medium text-white/60">播放列表</span>
                <span className="text-[10px] text-white/30">{playlist.length} 首</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {playlist.map((song, idx) => (
                  <div
                    key={`${song.id}-${idx}`}
                    onClick={() => playSong(song, idx)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${current === idx ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                  >
                    <div className="w-5 text-center text-[10px] text-white/30 shrink-0">
                      {current === idx && playing ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs truncate ${current === idx ? 'text-emerald-400' : 'text-white/70'}`}>{song.title}</div>
                      <div className="text-[10px] text-white/30 truncate">{song.artist}</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setLiked(prev => {
                        const next = new Set(prev);
                        if (next.has(song.id)) next.delete(song.id); else next.add(song.id);
                        return next;
                      }); }}
                      className="shrink-0"
                    >
                      <Heart className={`w-3.5 h-3.5 ${liked.has(song.id) ? 'text-red-400 fill-red-400' : 'text-white/20'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Player Area */}
        <div className="flex-1 flex flex-col">
          {/* Album Art / Visualizer */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="relative">
              <div className={`w-48 h-48 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center ${playing ? 'animate-pulse' : ''}`}>
                {mode === 'local' && playlist[current]?.isLocal ? (
                  <Upload className="w-16 h-16 text-white/20" />
                ) : (
                  <Disc3 className={`w-16 h-16 text-white/20 ${playing ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
                )}
              </div>
              {playing && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-1 bg-emerald-400/60 rounded-full animate-pulse" style={{ height: `${Math.random() * 16 + 4}px`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Song Info */}
          <div className="px-6 pb-2 text-center">
            <div className="text-sm font-medium text-white/90 truncate">{playlist[current]?.title || '未播放'}</div>
            <div className="text-xs text-white/40 mt-0.5">{playlist[current]?.artist || '未知艺术家'}</div>
          </div>

          {/* Progress */}
          <div className="px-6 py-2">
            <div
              className="h-1 bg-white/10 rounded-full cursor-pointer relative group"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                if (mode === 'local') {
                  setLocalProgress(percent * localDuration);
                } else if (audioRef.current) {
                  audioRef.current.currentTime = percent * (audioRef.current.duration || 0);
                }
              }}
            >
              <div
                className="h-full bg-emerald-400 rounded-full relative"
                style={{ width: `${mode === 'local' ? (localDuration ? (localProgress / localDuration) * 100 : 0) : (duration ? (progress / duration) * 100 : 0)}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-white/30">
              <span>{formatTime(mode === 'local' ? localProgress : progress)}</span>
              <span>{formatTime(mode === 'local' ? localDuration : duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="px-6 pb-4 flex items-center justify-center gap-4">
            <button onClick={() => setShuffle(s => !s)} className={`p-2 rounded-lg transition-colors ${shuffle ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/30 hover:text-white/60'}`}>
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={handlePrev} className="p-2 text-white/60 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={handleNext} className="p-2 text-white/60 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
            <button onClick={() => setRepeat(r => !r)} className={`p-2 rounded-lg transition-colors ${repeat ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/30 hover:text-white/60'}`}>
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Volume & Playlist Toggle */}
          <div className="px-6 pb-3 flex items-center gap-3">
            <button onClick={() => setMuted(m => !m)} className="text-white/40 hover:text-white/60 transition-colors">
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative group" ref={volumeRef} onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              setVolume(Math.max(0, Math.min(1, percent)));
            }}>
              <div className="h-full bg-white/40 rounded-full" style={{ width: `${volume * 100}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <button onClick={() => setShowPlaylist(p => !p)} className={`text-white/40 hover:text-white/60 transition-colors ${showPlaylist ? 'text-emerald-400' : ''}`}>
              <ListMusic className="w-4 h-4" />
            </button>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="px-6 pb-3 flex items-center gap-2 text-[10px] text-red-400/80">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span className="whitespace-pre-line">{apiError}</span>
            </div>
          )}

          {/* Local Mode Upload */}
          {mode === 'local' && (
            <div className="px-6 pb-4">
              <label className="flex items-center justify-center gap-2 py-2 bg-white/5 border border-white/10 border-dashed rounded-lg cursor-pointer hover:bg-white/[0.07] transition-colors">
                <Upload className="w-4 h-4 text-white/40" />
                <span className="text-xs text-white/50">上传本地音频文件 (MP3/FLAC/OGG)</span>
                <input type="file" accept="audio/*" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio element for online modes */}
      {mode !== 'local' && <audio ref={audioRef} className="hidden" />}
    </div>
  );
}
