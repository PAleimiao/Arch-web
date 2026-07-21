import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Square, Monitor, Mic, Video, Camera, CameraOff, AlertCircle } from 'lucide-react';

export default function OBSStudio() {
  const [recording, setRecording] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(15);
  const [droppedFrames] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Simulate CPU fluctuation
  useEffect(() => {
    const cpuInterval = setInterval(() => {
      setCpuUsage(10 + Math.floor(Math.random() * 25));
    }, 2000);
    return () => clearInterval(cpuInterval);
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraError(null);
  }, []);

  const requestCamera = useCallback(async () => {
    setCameraLoading(true);
    setCameraError(null);

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的浏览器不支持摄像头访问，请使用现代浏览器（Chrome、Firefox、Edge）');
      }

      // Request both video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      setCameraError(null);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMsg = '无法访问摄像头';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = '摄像头权限被拒绝，请在浏览器地址栏中点击摄像头图标并允许访问';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = '未检测到摄像头设备，请连接摄像头后重试';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = '摄像头已被其他应用占用，请关闭其他使用摄像头的程序';
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = '摄像头不支持请求的分辨率';
      } else if (err.message) {
        errorMsg = err.message;
      }

      setCameraError(errorMsg);
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  }, []);

  const toggleStreaming = useCallback(async () => {
    if (streaming) {
      // Stop streaming
      setStreaming(false);
      stopCamera();
      if (elapsedRef.current) {
        clearInterval(elapsedRef.current);
        elapsedRef.current = null;
      }
      setElapsed(0);
    } else {
      // Start streaming - request camera first
      await requestCamera();
      setStreaming(true);
      setRecording(false);
      elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
  }, [streaming, requestCamera, stopCamera]);

  const toggleRecording = useCallback(async () => {
    if (recording) {
      // Stop recording
      setRecording(false);
      stopCamera();
      if (elapsedRef.current) {
        clearInterval(elapsedRef.current);
        elapsedRef.current = null;
      }
      setElapsed(0);
    } else {
      // Start recording - request camera first
      await requestCamera();
      setRecording(true);
      setStreaming(false);
      elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
  }, [recording, requestCamera, stopCamera]);

  const switchScene = useCallback(async (scene: string) => {
    if (scene === '摄像头' || scene === '主场景') {
      if (!cameraActive) {
        await requestCamera();
      }
    } else {
      stopCamera();
    }
  }, [cameraActive, requestCamera, stopCamera]);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Preview */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex items-center justify-center relative" style={{ background: '#0A0A0A' }}>
          {/* Video element for camera stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />

          {/* Placeholder when camera is off */}
          {!cameraActive && (
            <div className="text-center z-10">
              <Monitor size={48} className="text-muted-foreground mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">显示器采集</div>
              <div className="text-xs text-muted-foreground mt-1">1920x1080 @ 60fps</div>
              {cameraError && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs max-w-xs mx-auto flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          )}

          {/* Loading state */}
          {cameraLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20" style={{ background: 'rgba(0,0,0,0.7)' }}>
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <div className="text-sm text-cyan-400">正在请求摄像头权限...</div>
                <div className="text-xs text-muted-foreground mt-1">请在浏览器弹窗中点击"允许"</div>
              </div>
            </div>
          )}

          {/* Status indicators */}
          {(recording || streaming) && cameraActive && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {recording && (
                <div className="flex items-center gap-1.5 bg-red-500/20 px-2 py-1 rounded">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-400">REC {formatTime(elapsed)}</span>
                </div>
              )}
              {streaming && (
                <div className="flex items-center gap-1.5 bg-green-500/20 px-2 py-1 rounded">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400">LIVE</span>
                </div>
              )}
            </div>
          )}

          {/* Camera active indicator */}
          {cameraActive && !recording && !streaming && (
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1.5 bg-cyan-500/20 px-2 py-1 rounded">
                <Camera size={12} className="text-cyan-400" />
                <span className="text-xs text-cyan-400">摄像头已启用</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-48 border-l border-white/5 p-3 space-y-4 flex-shrink-0 overflow-y-auto">
          <div>
            <div className="text-xs text-muted-foreground mb-2">混音器</div>
            <div className="space-y-2">
              <div className="glass-panel rounded-lg p-2">
                <div className="flex items-center gap-2 text-xs"><Mic size={12} /> 麦克风</div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1">
                  <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${30 + Math.floor(Math.random() * 40)}%` }} />
                </div>
              </div>
              <div className="glass-panel rounded-lg p-2">
                <div className="flex items-center gap-2 text-xs"><Video size={12} /> 桌面音频</div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1">
                  <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${40 + Math.floor(Math.random() * 30)}%` }} />
                </div>
              </div>
              {cameraActive && (
                <div className="glass-panel rounded-lg p-2">
                  <div className="flex items-center gap-2 text-xs"><Camera size={12} /> 摄像头音频</div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-1">
                    <div className="h-full bg-purple-400 rounded-full transition-all" style={{ width: `${20 + Math.floor(Math.random() * 50)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">场景</div>
            <div className="space-y-1">
              {['主场景', '摄像头', '游戏', '代码', '音乐'].map(s => (
                <button
                  key={s}
                  onClick={() => switchScene(s)}
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  {s === '摄像头' && <Camera size={12} className="text-purple-400" />}
                  {s === '主场景' && <Monitor size={12} className="text-cyan-400" />}
                  {s === '游戏' && <Video size={12} className="text-green-400" />}
                  {s === '代码' && <span className="text-yellow-400 text-xs">{'</>'}</span>}
                  {s === '音乐' && <span className="text-pink-400 text-xs">♪</span>}
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">来源</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs px-2 py-1">
                <Monitor size={12} className="text-cyan-400" />
                <span>显示器采集</span>
              </div>
              {cameraActive && (
                <div className="flex items-center gap-2 text-xs px-2 py-1">
                  <Camera size={12} className="text-purple-400" />
                  <span>摄像头</span>
                  <button onClick={stopCamera} className="ml-auto text-red-400 hover:text-red-300">
                    <CameraOff size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="h-12 flex items-center justify-between px-4 border-t border-white/5 flex-shrink-0" style={{ background: '#1E1E1E' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleStreaming}
            disabled={cameraLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors disabled:opacity-50 ${
              streaming ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {streaming ? <Square size={12} /> : <Play size={12} />}
            {streaming ? '停止直播' : '开始直播'}
          </button>
          <button
            onClick={toggleRecording}
            disabled={cameraLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors disabled:opacity-50 ${
              recording ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
            }`}
          >
            {recording ? <Square size={12} /> : <Play size={12} />}
            {recording ? '停止录制' : '开始录制'}
          </button>
          {!cameraActive ? (
            <button
              onClick={requestCamera}
              disabled={cameraLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors disabled:opacity-50 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
            >
              <Camera size={12} />
              开启摄像头
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <CameraOff size={12} />
              关闭摄像头
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>CPU: {cpuUsage}%</span>
          <span>丢帧: {droppedFrames}</span>
          {cameraActive && <span className="text-cyan-400">● 摄像头运行中</span>}
        </div>
      </div>
    </div>
  );
}
