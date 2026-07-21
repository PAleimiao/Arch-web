import { useState, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [time, setTime] = useState(new Date());
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = () => {
    if (password === 'arch' || password === '') {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  const dateStr = time.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-[99999] lock-screen flex flex-col items-center justify-center"
      onClick={() => !showInput && setShowInput(true)}>

      {/* Time */}
      <div className="text-center mb-8 animate-slideUp">
        <div className="text-6xl sm:text-8xl font-light mb-2" style={{ fontFamily: '"Orbitron", sans-serif', textShadow: '0 0 40px rgba(0,180,216,0.3)' }}>
          {String(time.getHours()).padStart(2, '0')}:{String(time.getMinutes()).padStart(2, '0')}
        </div>
        <div className="text-base sm:text-lg text-muted-foreground">{dateStr}</div>
      </div>

      {/* Unlock */}
      {showInput && (
        <div className="animate-fadeIn w-64">
          <div className="flex items-center gap-2 glass-panel rounded-xl px-4 py-3"
            style={{ border: error ? '1px solid #EF233C' : '1px solid rgba(0,180,216,0.2)' }}>
            <Lock size={16} className="text-muted-foreground flex-shrink-0" />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="密码: arch"
              className="bg-transparent outline-none flex-1 text-sm"
              autoFocus
            />
            <button onClick={handleUnlock} className="p-1 rounded hover:bg-white/10 flex-shrink-0">
              <ArrowRight size={16} className="text-cyan-400" />
            </button>
          </div>
          {error && <div className="text-xs text-red-400 mt-2 text-center">密码错误</div>}
          <div className="text-xs text-muted-foreground mt-3 text-center">按 Enter 或点击箭头解锁</div>
        </div>
      )}

      {!showInput && (
        <div className="text-sm text-muted-foreground animate-pulse mt-4">点击屏幕解锁</div>
      )}
    </div>
  );
}
