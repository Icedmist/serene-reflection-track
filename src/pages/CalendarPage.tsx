import { useStore } from '@/lib/store';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Star, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HijriUtils } from '@/lib/hijri-utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const ODD_NIGHTS = [21, 23, 25, 27, 29];

export default function CalendarPage() {
  const { state, getDayLog, updateHijriOffset } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());
  const [isHijriView, setIsHijriView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // For Hijri View, we track current Hijri Month/Year
  const [hMonth, setHMonth] = useState(() => HijriUtils.getHijriParts(new Date(), state.hijriOffset).month);
  const [hYear, setHYear] = useState(() => HijriUtils.getHijriParts(new Date(), state.hijriOffset).year);

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

  const getDayRamadanDay = (day: number) => {
    return HijriUtils.getRamadanDay(new Date(currentYear, currentMonth, day), state.hijriOffset);
  };
  const selectedLog = selectedDate ? getDayLog(selectedDate) : null;

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-lg font-bold gold-text">Calendar</h1>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1">
          <Button
            variant={!isHijriView ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setIsHijriView(false)}
            className="text-[10px] h-7 px-2"
          >
            Gregorian
          </Button>
          <Button
            variant={isHijriView ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setIsHijriView(true)}
            className="text-[10px] h-7 px-2"
          >
            Hijri
          </Button>
        </div>

        <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2 flex-1">
          <button
            onClick={() => {
              if (isHijriView) {
                setHMonth(m => m === 1 ? 12 : m - 1);
                if (hMonth === 1) setHYear(y => y - 1);
              } else {
                setCurrentMonth(m => m === 0 ? 11 : m - 1);
              }
            }}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 text-center">
            {isHijriView ? (
              <>
                <p className="text-sm font-semibold">{HijriUtils.getMonthName(hMonth)} {hYear} AH</p>
                <p className="text-[10px] text-muted-foreground italic">Standard Lunar View</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold">{MONTH_NAMES[currentMonth]} {currentYear}</p>
                <p className="text-[10px] text-muted-foreground">{HijriUtils.getHijriMonthRange(currentYear, currentMonth, state.hijriOffset)} AH</p>
              </>
            )}
          </div>
          <button
            onClick={() => {
              if (isHijriView) {
                setHMonth(m => m === 12 ? 1 : m + 1);
                if (hMonth === 12) setHYear(y => y + 1);
              } else {
                setCurrentMonth(m => m === 11 ? 0 : m + 1);
              }
            }}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="glass-card h-10 w-10">
              <Settings2 className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 glass-card border-primary/20 p-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold gold-text">Regional Settings</h4>
                <p className="text-[10px] text-muted-foreground">Adjust Hijri date based on your local moon sighting.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span>Hijri Offset</span>
                  <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">{state.hijriOffset > 0 ? `+${state.hijriOffset}` : state.hijriOffset} days</span>
                </div>
                <Slider
                  value={[state.hijriOffset]}
                  min={-2}
                  max={2}
                  step={1}
                  onValueChange={([val]) => updateHijriOffset(val)}
                  className="py-2"
                />
                <div className="flex justify-between text-[8px] text-muted-foreground">
                  <span>-2d</span>
                  <span>Standard</span>
                  <span>+2d</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="glass-card p-2.5">
        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {DAY_NAMES.map((d, i) => (
            <div key={i} className="text-center text-[9px] text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {(() => {
            if (!isHijriView) {
              return (
                <>
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {days.map(day => {
                    const status = getDayStatus(day);
                    const rDay = getDayRamadanDay(day);
                    const isOdd = rDay > 0 && ODD_NIGHTS.includes(rDay);
                    const dateStr = getDateStr(day);
                    const isSelected = selectedDate === dateStr;

                    const hParts = HijriUtils.getHijriParts(new Date(currentYear, currentMonth, day), state.hijriOffset);

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/10' :
                          status === 'complete' ? 'bg-accent/15' :
                            status === 'partial' ? 'bg-primary/10' :
                              status === 'missed' ? 'bg-destructive/10' : 'bg-secondary/30'
                          }`}
                      >
                        <span className={`text-[11px] font-medium ${status === 'complete' ? 'text-accent' : status === 'partial' ? 'gold-text' : ''}`}>{day}</span>
                        <span className="text-[8px] text-primary/70 font-bold leading-none mt-0.5">{hParts.day}</span>
                        {rDay > 0 && <span className="text-[7px] text-muted-foreground/60 leading-none mt-0.5">R{rDay}</span>}
                        {isOdd && <Star className="absolute top-0 right-0 w-2 h-2 text-primary fill-primary" />}
                        {status === 'complete' && <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent" />}
                      </button>
                    );
                  })}
                </>
              );
            } else {
              // Hijri View Grid
              const hijriDays = Array.from({ length: 30 }, (_, i) => i + 1);
              const firstG = HijriUtils.getGregorianFromHijri(hYear, hMonth, 1, state.hijriOffset);
              const hFirstDay = firstG.getDay();

              return (
                <>
                  {Array.from({ length: hFirstDay }).map((_, i) => <div key={`he-${i}`} />)}
                  {hijriDays.map(hd => {
                    const gDate = HijriUtils.getGregorianFromHijri(hYear, hMonth, hd, state.hijriOffset);
                    const checkH = HijriUtils.getHijriParts(gDate, state.hijriOffset);
                    if (checkH.month !== hMonth) return null;

                    const dateStr = gDate.toISOString().split('T')[0];
                    const log = getDayLog(dateStr);
                    const status = log ? (log.completionPercent >= 80 ? 'complete' : log.completionPercent >= 30 ? 'partial' : 'missed') : 'none';
                    const isSelected = selectedDate === dateStr;
                    const isOdd = hMonth === 9 && ODD_NIGHTS.includes(hd);

                    return (
                      <button
                        key={hd}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/10' :
                          status === 'complete' ? 'bg-accent/15' :
                            status === 'partial' ? 'bg-primary/10' :
                              status === 'missed' ? 'bg-destructive/10' : 'bg-secondary/30'
                          }`}
                      >
                        <span className={`text-[11px] font-bold ${hMonth === 9 ? 'gold-text' : 'text-primary'}`}>{hd}</span>
                        <span className="text-[8px] text-muted-foreground leading-none mt-0.5">{gDate.getDate()}</span>
                        {isOdd && <Star className="absolute top-0 right-0 w-2 h-2 text-primary fill-primary" />}
                        {status === 'complete' && <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent" />}
                      </button>
                    );
                  })}
                </>
              );
            }
          })()}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-accent/30" /> 80%+</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/20" /> 30%+</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-destructive/20" /> Low</span>
        <span className="flex items-center gap-1"><Star className="w-2 h-2 text-primary fill-primary" /> Odd</span>
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass-card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {(() => {
                  const d = new Date(selectedDate);
                  const rd = HijriUtils.getRamadanDay(d, state.hijriOffset);
                  const hp = HijriUtils.getHijriParts(d, state.hijriOffset);
                  return rd > 0 ? `Ramadan Day ${rd}` : `${hp.day} ${HijriUtils.getMonthName(hp.month)}`;
                })()}
              </h3>
              {selectedLog && (
                <span className="text-xs gold-text font-medium">{selectedLog.completionPercent}%</span>
              )}
            </div>
            {selectedLog ? (
              <>
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
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4 italic">No activity logged yet for this date.</p>
            )}
            {selectedLog?.reflectionNote && (
              <p className="text-[10px] text-muted-foreground italic border-t border-border pt-2">"{selectedLog.reflectionNote}"</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
