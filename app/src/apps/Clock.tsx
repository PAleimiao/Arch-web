import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const ZONES = [
  { city: '北京', zone: 'Asia/Shanghai', offset: '+08:00' },
  { city: '东京', zone: 'Asia/Tokyo', offset: '+09:00' },
  { city: '伦敦', zone: 'Europe/London', offset: '+01:00' },
  { city: '纽约', zone: 'America/New_York', offset: '-04:00' },
  { city: '悉尼', zone: 'Australia/Sydney', offset: '+10:00' },
  { city: '巴黎', zone: 'Europe/Paris', offset: '+02:00' },
];

const ALARMS = [
  { time: '07:00', label: '起床', enabled: true },
  { time: '08:30', label: '上班', enabled: true },
  { time: '12:00', label: '午休', enabled: false },
];

export default function ClockApp() {
  const [time, setTime] = useState(new Date());
  const [tab, setTab] = useState<'clock' | 'alarm' | 'world'>('clock');
  const [alarms, setAlarms] = useState(ALARMS);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleAlarm = (i: number) => {
    setAlarms(alarms.map((a, idx) => idx === i ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex gap-1 p-2 border-b border-white/5">
        {[{ id: 'clock', label: '时钟' }, { id: 'alarm', label: '闹钟' }, { id: 'world', label: '世界' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex-1 py-1.5 rounded-lg text-sm ${tab === t.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'clock' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-5xl sm:text-6xl font-light mb-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            {String(time.getHours()).padStart(2, '0')}:{String(time.getMinutes()).padStart(2, '0')}:{String(time.getSeconds()).padStart(2, '0')}
          </div>
          <div className="text-sm text-muted-foreground">{time.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          {/* Analog clock */}
          <div className="mt-6 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-white/10 relative flex items-center justify-center">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="absolute w-0.5 h-2 bg-white/30" style={{ transform: `rotate(${i * 30}deg) translateY(-55px)` }} />
            ))}
            <div className="absolute w-0.5 h-10 bg-cyan-400 rounded-full origin-bottom"
              style={{ transform: `rotate(${(time.getHours() % 12) * 30 + time.getMinutes() * 0.5}deg) translateY(-20px)` }} />
            <div className="absolute w-0.5 h-14 bg-white/70 rounded-full origin-bottom"
              style={{ transform: `rotate(${time.getMinutes() * 6}deg) translateY(-28px)` }} />
            <div className="absolute w-px h-16 bg-red-400 rounded-full origin-bottom"
              style={{ transform: `rotate(${time.getSeconds() * 6}deg) translateY(-32px)` }} />
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
        </div>
      )}

      {tab === 'alarm' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {alarms.map((a, i) => (
            <div key={i} className="glass-panel rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-2xl font-light" style={{ fontFamily: '"Orbitron", sans-serif' }}>{a.time}</div>
                <div className="text-xs text-muted-foreground">{a.label}</div>
              </div>
              <button onClick={() => toggleAlarm(i)}
                className={`w-10 h-6 rounded-full relative transition-colors ${a.enabled ? 'bg-cyan-400/30' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${a.enabled ? 'right-0.5 bg-cyan-400' : 'left-0.5 bg-muted-foreground'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'world' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {ZONES.map(z => {
            const d = new Date(time.toLocaleString('en-US', { timeZone: z.zone }));
            return (
              <div key={z.city} className="glass-panel rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-cyan-400" />
                  <div>
                    <div className="text-sm">{z.city}</div>
                    <div className="text-xs text-muted-foreground">{z.offset}</div>
                  </div>
                </div>
                <div className="text-lg font-light" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                  {String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
