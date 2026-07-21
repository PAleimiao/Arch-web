import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock } from 'lucide-react';

interface CalendarEvent {
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
}

const PRESET_EVENTS: CalendarEvent[] = [
  { date: '2026-07-08', title: '项目发布', color: '#EF4444' },
  { date: '2026-07-10', title: '团队会议', color: '#3B82F6' },
  { date: '2026-07-15', title: '版本更新', color: '#10B981' },
  { date: '2026-07-20', title: '代码评审', color: '#F59E0B' },
  { date: '2026-07-25', title: '月度总结', color: '#8B5CF6' },
];

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: Array<{ date: number; isCurrentMonth: boolean; fullDate: string }> = [];

    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({ date: d, isCurrentMonth: false, fullDate: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      days.push({ date: d, isCurrentMonth: true, fullDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 1 : month + 2;
      const y = month === 11 ? year + 1 : year;
      days.push({ date: d, isCurrentMonth: false, fullDate: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }

    return days;
  }, [year, month]);

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return PRESET_EVENTS.filter(e => e.date === selectedDate);
  }, [selectedDate]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(todayStr); };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <CalIcon size={16} className="text-cyan-400" />
          <span className="text-sm font-medium">日历</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-white/10 transition-colors"><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium w-28 text-center">{year}年 {monthNames[month]}</span>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-white/10 transition-colors"><ChevronRight size={16} /></button>
          <button onClick={goToday} className="ml-2 px-2 py-0.5 rounded text-[10px] bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition-colors">今天</button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Calendar grid */}
        <div className="flex-1 p-3">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[10px] text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, i) => {
              const isToday = day.fullDate === todayStr;
              const isSelected = day.fullDate === selectedDate;
              const hasEvent = PRESET_EVENTS.some(e => e.date === day.fullDate);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day.fullDate)}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                    isSelected ? 'bg-cyan-400/20 border border-cyan-400/50' :
                    isToday ? 'bg-white/10 border border-white/20' :
                    'hover:bg-white/5'
                  } ${!day.isCurrentMonth ? 'opacity-30' : ''}`}
                >
                  <span className={isToday ? 'text-cyan-400 font-bold' : ''}>{day.date}</span>
                  {hasEvent && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side panel - events */}
        <div className="w-48 border-l border-white/5 p-3 overflow-y-auto flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Clock size={12} />
            <span>日程</span>
          </div>
          {selectedDate ? (
            <div>
              <div className="text-xs font-medium mb-2">{selectedDate}</div>
              {selectedEvents.length > 0 ? (
                selectedEvents.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5 mb-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
                    <span className="text-[10px]">{e.title}</span>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-muted-foreground">暂无日程</div>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground">点击日期查看日程</div>
          )}

          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="text-[10px] text-muted-foreground mb-2">即将到来的事件</div>
            {PRESET_EVENTS.slice(0, 5).map((e, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 mb-1">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] truncate">{e.title}</div>
                  <div className="text-[9px] text-muted-foreground">{e.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
