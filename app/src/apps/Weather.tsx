import { CloudSun, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Gauge } from 'lucide-react';

const FORECAST = [
  { day: '今天', icon: 'sun', high: 28, low: 18, condition: '晴' },
  { day: '明天', icon: 'cloud', high: 26, low: 17, condition: '多云' },
  { day: '周三', icon: 'rain', high: 22, low: 15, condition: '小雨' },
  { day: '周四', icon: 'sun', high: 29, low: 19, condition: '晴' },
  { day: '周五', icon: 'cloud', high: 25, low: 16, condition: '多云' },
  { day: '周六', icon: 'rain', high: 21, low: 14, condition: '中雨' },
  { day: '周日', icon: 'sun', high: 30, low: 20, condition: '晴' },
];

const WeatherIcon = ({ type, size = 24 }: { type: string; size?: number }) => {
  switch (type) {
    case 'sun': return <Sun size={size} className="text-yellow-400" />;
    case 'cloud': return <CloudSun size={size} className="text-gray-400" />;
    case 'rain': return <CloudRain size={size} className="text-blue-400" />;
    case 'snow': return <CloudSnow size={size} className="text-white" />;
    default: return <CloudSun size={size} className="text-gray-400" />;
  }
};

export default function Weather() {
  return (
    <div className="w-full h-full flex flex-col p-4 overflow-y-auto" style={{ background: 'rgba(0, 18, 51, 0.9)' }}>
      {/* Current */}
      <div className="glass-panel rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">成都市</div>
            <div className="text-4xl font-light mt-1">28°C</div>
            <div className="text-sm text-muted-foreground mt-1">晴朗</div>
          </div>
          <Sun size={48} className="text-yellow-400" />
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/5">
          <div className="flex flex-col items-center gap-1">
            <Wind size={14} className="text-cyan-400" />
            <span className="text-xs">3级</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Droplets size={14} className="text-blue-400" />
            <span className="text-xs">45%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Eye size={14} className="text-purple-400" />
            <span className="text-xs">15km</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Gauge size={14} className="text-green-400" />
            <span className="text-xs">1013</span>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="glass-panel rounded-xl p-3 space-y-2">
        {FORECAST.map((f, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <span className="text-sm w-10">{f.day}</span>
            <WeatherIcon type={f.icon} size={18} />
            <span className="text-xs text-muted-foreground flex-1">{f.condition}</span>
            <span className="text-sm">{f.high}° / {f.low}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
