import { useStore } from '@/lib/store';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ODD_NIGHTS = [21, 23, 25, 27, 29];

export default function CalendarPage() {
  const { state, getDayLog } = useStore();
  const [currentMonth, setCurrentMonth] = useState(2); // March 2025
  const [currentYear] = useState(2025);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDateStr = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  const getDayStatus = (day: number) => {
    const log = getDayLog(getDateStr(day));
    if (!log) return 'none';
    if (log.completionPercent >= 80) return 'complete';
    if (log.completionPercent >= 30) return 'partial';
    return 'missed';
  };

  const getRamadanDay = (day: number) => {
    const log = getDayLog(getDateStr(day));
    return log?.ramadanDay;
  };

  const selectedLog = selectedDate ? getDayLog(selectedDate) : null;

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold gold-text">Calendar</h1>

      {/* Month nav */}
      <div className="flex items-center justify-between glass-card px-4 py-3">
        <button onClick={() => setCurrentMonth(m => Math.max(0, m - 1))} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold">{MONTH_NAMES[currentMonth]} {currentYear}</span>
        <button onClick={() => setCurrentMonth(m => Math.min(11, m + 1))} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="glass-card p-3">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(day => {
            const status = getDayStatus(day);
            const rDay = getRamadanDay(day);
            const isOdd = rDay && ODD_NIGHTS.includes(rDay);
            const dateStr = getDateStr(day);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                  isSelected ? 'ring-2 ring-primary bg-primary/10' :
                  status === 'complete' ? 'bg-accent/15' :
                  status === 'partial' ? 'bg-primary/10' :
                  status === 'missed' ? 'bg-destructive/10' : 'bg-secondary/30'
                }`}
              >
                <span className={`font-medium ${status === 'complete' ? 'text-accent' : status === 'partial' ? 'gold-text' : ''}`}>
                  {day}
                </span>
                {rDay && <span className="text-[8px] text-muted-foreground">R{rDay}</span>}
                {isOdd && <Star className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-primary fill-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-accent/30" /> Complete</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary/20" /> Partial</span>
        <span className="flex items-center gap-1"><Star className="w-2.5 h-2.5 text-primary fill-primary" /> Odd Night</span>
      </div>

      {/* Selected day detail */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Ramadan Day {selectedLog.ramadanDay}</h3>
              <span className="text-sm gold-text font-medium">{selectedLog.completionPercent}%</span>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {selectedLog.tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={task.completed ? 'text-muted-foreground line-through' : ''}>{task.title}</span>
                </div>
              ))}
            </div>
            {selectedLog.reflectionNote && (
              <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
                "{selectedLog.reflectionNote}"
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
