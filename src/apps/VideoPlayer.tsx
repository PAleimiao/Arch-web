import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize, Plus, Trash2, Tv } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  url: string;
  type: 'mp4' | 'm3u8';
}

const DEFAULT_VIDEOS: VideoItem[] = [
  { id: '1', title: 'Big Buck Bunny', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'mp4' },
  { id: '2', title: 'Elephant Dream', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', type: 'mp4' },
  { id: '3', title: 'For Bigger Blazes', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', type: 'mp4' },
  { id: '4', title: 'For Bigger Escapes', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', type: 'mp4' },
];

const STORAGE_KEY = 'arch-web-video-playlist';

function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [playlist, setPlaylist] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_VIDEOS;
    } catch {
      return DEFAULT_VIDEOS;
    }
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

  const currentVideo = playlist[currentIndex] || playlist[0];

  // 保存播放列表到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist));
  }, [playlist]);

  // 切换视频时初始化 hls.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo) return;

    // 清理旧的 hls 实例
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setError('');
    setProgress(0);
    setDuration(0);

    if (currentVideo.type === 'm3u8' && (window as any).Hls && (window as any).Hls.isSupported()) {
      const Hls = (window as any).Hls;
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(currentVideo.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setIsPlaying(true);
      });
      hls.on(Hls.Events.ERROR, (_: any, data: any) => {
        if (data.fatal) {
          setError(`直播源加载失败: ${data.type}`);
          setIsPlaying(false);
        }
      });
    } else {
      video.src = currentVideo.url;
      video.load();
      if (currentVideo.type === 'mp4') {
        video.play().catch(() => {});
        setIsPlaying(true);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentVideo]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setProgress((video.currentTime / video.duration) * 100 || 0);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const time = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = time;
    setProgress(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const playPrev = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const addVideo = () => {
    if (!newUrl.trim()) return;
    const url = newUrl.trim();
    const type = url.endsWith('.m3u8') || url.includes('.m3u8') ? 'm3u8' : 'mp4';
    const title = newTitle.trim() || (type === 'm3u8' ? `直播源 ${playlist.length + 1}` : `视频 ${playlist.length + 1}`);
    const item: VideoItem = {
      id: Date.now().toString(),
      title,
      url,
      type,
    };
    setPlaylist([...playlist, item]);
    setNewUrl('');
    setNewTitle('');
    setCurrentIndex(playlist.length);
  };

  const removeVideo = (id: string) => {
    const idx = playlist.findIndex((v) => v.id === id);
    const newPlaylist = playlist.filter((v) => v.id !== id);
    setPlaylist(newPlaylist);
    if (idx === currentIndex && newPlaylist.length > 0) {
      setCurrentIndex(0);
    } else if (idx < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
      {/* 视频区域 */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          className="max-w-full max-h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={playNext}
          onError={() => setError('视频加载失败，请检查链接')}
          playsInline
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <Tv className="w-12 h-12 mx-auto mb-2 text-red-400" />
              <p className="text-red-400">{error}</p>
              <p className="text-sm text-gray-400 mt-1">{currentVideo?.url}</p>
            </div>
          </div>
        )}
      </div>

      {/* 控制栏 */}
      <div className="bg-[#2a2a2a] p-3 space-y-2">
        {/* 进度条 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12 text-right">{formatTime(videoRef.current?.currentTime || 0)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-12">{formatTime(duration)}</span>
        </div>

        {/* 按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={playPrev} className="p-1 hover:bg-white/10 rounded">
              <SkipBack className="w-5 h-5" />
            </button>
            <button onClick={togglePlay} className="p-2 bg-[#1793d1] hover:bg-[#147bb5] rounded-full">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={playNext} className="p-1 hover:bg-white/10 rounded">
              <SkipForward className="w-5 h-5" />
            </button>
            <button onClick={toggleMute} className="p-1 hover:bg-white/10 rounded">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 truncate max-w-[200px]">
              {currentVideo?.title}
              {currentVideo?.type === 'm3u8' && <span className="ml-1 text-[#1793d1]">[直播]</span>}
            </span>
            <button onClick={toggleFullscreen} className="p-1 hover:bg-white/10 rounded">
              <Maximize className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`p-1 rounded ${showPlaylist ? 'bg-[#1793d1]' : 'hover:bg-white/10'}`}
            >
              <Tv className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 播放列表 */}
      {showPlaylist && (
        <div className="bg-[#2a2a2a] border-t border-gray-700 p-3 max-h-48 overflow-y-auto">
          {/* 添加新视频 */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="视频标题（可选）"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-2 py-1 bg-[#1a1a1a] border border-gray-600 rounded text-sm"
            />
            <input
              type="text"
              placeholder="输入视频或 m3u8 链接..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addVideo()}
              className="flex-[2] px-2 py-1 bg-[#1a1a1a] border border-gray-600 rounded text-sm"
            />
            <button
              onClick={addVideo}
              className="px-3 py-1 bg-[#1793d1] hover:bg-[#147bb5] rounded text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          {/* 列表 */}
          <div className="space-y-1">
            {playlist.map((video, idx) => (
              <div
                key={video.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer text-sm ${
                  idx === currentIndex ? 'bg-[#1793d1]/30 border border-[#1793d1]' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs text-gray-500 w-4">{idx + 1}</span>
                  <span className="truncate">{video.title}</span>
                  {video.type === 'm3u8' && (
                    <span className="text-xs bg-[#1793d1]/20 text-[#1793d1] px-1 rounded">直播</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeVideo(video.id);
                  }}
                  className="p-1 hover:bg-red-500/20 rounded text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {playlist.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">播放列表为空，添加一个视频或 m3u8 直播源吧</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
