import { useState } from 'react';
import { Download, Upload, Server, Wifi, Signal } from 'lucide-react';

interface SpeedPoint {
  time: number;
  download: number;
  upload: number;
}

export default function NetworkSpeed() {
  const [testing, setTesting] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<SpeedPoint[]>([]);
  

  const startTest = () => {
    if (testing) return;
    setTesting(true);
    setProgress(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setPing(0);
    setHistory([]);

    // Simulate ping
    setTimeout(() => setPing(Math.floor(Math.random() * 20) + 10), 500);

    // Simulate download test
    let dl = 0;
    const dlInterval = setInterval(() => {
      dl += Math.random() * 15 + 5;
      setDownloadSpeed(dl);
      setProgress(p => Math.min(p + 1, 50));
      setHistory(h => [...h.slice(-20), { time: Date.now(), download: dl, upload: 0 }]);
      if (dl > 800) { clearInterval(dlInterval); startUpload(); }
    }, 100);

    const startUpload = () => {
      let ul = 0;
      const ulInterval = setInterval(() => {
        ul += Math.random() * 8 + 2;
        setUploadSpeed(ul);
        setProgress(p => Math.min(p + 1, 100));
        setHistory(h => [...h.slice(-20), { time: Date.now(), download: 0, upload: ul }]);
        if (ul > 400) {
          clearInterval(ulInterval);
          setTesting(false);
          setProgress(100);
        }
      }, 100);
    };
  };

  const formatSpeed = (mbps: number) => {
    if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gbps`;
    return `${mbps.toFixed(1)} Mbps`;
  };

  return (
    <div className="w-full h-full flex flex-col p-4" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      {/* Gauge */}
      <div className="glass-panel rounded-xl p-4 mb-3 text-center relative overflow-hidden">
        <div className="w-32 h-32 mx-auto relative">
          <svg viewBox="0 0 100 60" className="w-full h-full">
            <path d="M10 55 A 40 40 0 0 1 90 55" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
            <path d="M10 55 A 40 40 0 0 1 90 55" fill="none" stroke="url(#speedGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * 126} 126`} />
            <defs>
              <linearGradient id="speedGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00B4D8" />
                <stop offset="100%" stopColor="#2DC653" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <div className="text-2xl font-bold" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              {testing ? formatSpeed(downloadSpeed || uploadSpeed) : '---'}
            </div>
          </div>
        </div>

        <button onClick={startTest} disabled={testing}
          className="mt-2 px-6 py-2 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50 font-medium">
          {testing ? `测试中... ${progress}%` : '开始测速'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="glass-panel rounded-lg p-2 text-center">
          <Download size={14} className="text-cyan-400 mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">下载</div>
          <div className="text-sm font-bold">{downloadSpeed > 0 ? formatSpeed(downloadSpeed) : '--'}</div>
        </div>
        <div className="glass-panel rounded-lg p-2 text-center">
          <Upload size={14} className="text-green-400 mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">上传</div>
          <div className="text-sm font-bold">{uploadSpeed > 0 ? formatSpeed(uploadSpeed) : '--'}</div>
        </div>
        <div className="glass-panel rounded-lg p-2 text-center">
          <Signal size={14} className="text-purple-400 mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">延迟</div>
          <div className="text-sm font-bold">{ping > 0 ? `${ping}ms` : '--'}</div>
        </div>
      </div>

      {/* History chart */}
      <div className="flex-1 glass-panel rounded-lg p-2 overflow-hidden">
        <div className="text-xs text-muted-foreground mb-1">速度曲线</div>
        {history.length > 0 ? (
          <svg className="w-full h-full" viewBox={`0 0 ${history.length} 100`} preserveAspectRatio="none">
            <polyline
              points={history.map((h, i) => `${i},${100 - Math.min(h.download / 10, 100)}`).join(' ')}
              fill="none" stroke="#00B4D8" strokeWidth="1.5" />
            <polyline
              points={history.map((h, i) => `${i},${100 - Math.min(h.upload / 10, 100)}`).join(' ')}
              fill="none" stroke="#2DC653" strokeWidth="1.5" />
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            <Wifi size={16} className="mr-1" /> 点击开始测速
          </div>
        )}
      </div>

      {/* Server info */}
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <Server size={12} />
        <span>服务器: 成都电信</span>
        <span className="ml-auto">ISP: China Telecom</span>
      </div>
    </div>
  );
}
