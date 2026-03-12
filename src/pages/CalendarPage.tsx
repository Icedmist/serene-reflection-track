import { useStore } from '@/lib/store';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const ODD_NIGHTS = [21, 23, 25, 27, 29];

export default function CalendarPage() {
  const { state, getDayLog } = useStore();
  const [currentMonth, setCurrentMonth] = useState(2);
  const [currentYear] = useState(2025);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDateStr = (day: number) => `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getDayStatus = (day: number) => {
    const log = getDayLog(getDateStr(day));
    if (!log) return 'none';
    if (log.completionPercent >= 80) return 'complete';
    if (log.completionPercent >= 30) return 'partial';
    return 'missed';
  };

  const getRamadanDay = (day: number) => getDayLog(getDateStr(day))?.ramadanDay;
  const selectedLog = selectedDate ? getDayLog(selectedDate) : null;

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-lg font-bold gold-text">Calendar</h1>

      <div className="flex items-center justify-between glass-card px-3 py-2.5">
        <button onClick={() => setCurrentMonth(m => Math.max(0, m - 1))} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold">{MONTH_NAMES[currentMonth]} {currentYear}</span>
        <button onClick={() => setCurrentMonth(m => Math.min(11, m + 1))} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="glass-card p-2.5">
        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {DAY_NAMES.map((d, i) => (
            <div key={i} className="text-center text-[9px] text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
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
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] transition-all ${
                  isSelected ? 'ring-2 ring-primary bg-primary/10' :
                  status === 'complete' ? 'bg-accent/15' :
                  status === 'partial' ? 'bg-primary/10' :
                  status === 'missed' ? 'bg-destructive/10' : 'bg-secondary/30'
                }`}
              >
                <span className={`font-medium ${status === 'complete' ? 'text-accent' : status === 'partial' ? 'gold-text' : ''}`}>{day}</span>
                {rDay && <span className="text-[7px] text-muted-foreground leading-none">R{rDay}</span>}
                {isOdd && <Star className="absolute top-0 right-0 w-2 h-2 text-primary fill-primary" />}
                {status === 'complete' && <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-accent/30" /> 80%+</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/20" /> 30%+</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-destructive/20" /> Low</span>
        <span className="flex items-center gap-1"><Star className="w-2 h-2 text-primary fill-primary" /> Odd</span>
      </div>

      <AnimatePresence>
        {selectedLog && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass-card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Ramadan Day {selectedLog.ramadanDay}</h3>
              <span className="text-xs gold-text font-medium">{selectedLog.completionPercent}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${selectedLog.completionPercent}%` }} />
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {selectedLog.tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 text-xs py-0.5">
                  {task.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                  <span className={task.completed ? 'text-muted-foreground line-through' : ''}>{task.title}</span>
                  {task.timeSlot && <span className="text-[9px] text-muted-foreground ml-auto">{task.timeSlot}</span>}
                </div>
              ))}
            </div>
            {selectedLog.reflectionNote && (
              <p className="text-[10px] text-muted-foreground italic border-t border-border pt-2">"{selectedLog.reflectionNote}"</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
