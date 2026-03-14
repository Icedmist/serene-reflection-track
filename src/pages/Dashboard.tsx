import { useStore } from '@/lib/store';
import { SURAH_NAMES, TIME_BLOCK_LABELS, TIME_BLOCK_ORDER } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Flame, BookOpen, CheckCircle2, Circle, PenLine, ChevronRight, ChevronDown, Trophy, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HijriUtils } from '@/lib/hijri-utils';

const categoryColors: Record<string, string> = {
  salah: 'bg-primary/20 text-primary',
  quran: 'bg-accent/20 text-accent',
  dhikr: 'bg-primary/15 text-primary',
  dua: 'bg-accent/15 text-accent',
  meal: 'bg-secondary text-secondary-foreground',
  rest: 'bg-secondary text-muted-foreground',
  custom: 'bg-secondary text-secondary-foreground',
};

export default function Dashboard() {
  const { state, todayLog, toggleTask, updateReflection } = useStore();
  const [reflection, setReflection] = useState(todayLog.reflectionNote || '');
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({ dawn: true, morning: true, afternoon: true, evening: true, night: true });

  const hijriDate = HijriUtils.getHijriParts(new Date(), state.hijriOffset);
  const hijriMonthName = HijriUtils.getMonthName(hijriDate.month);
  const ramadanDay = HijriUtils.getRamadanDay(new Date(), state.hijriOffset);

  const completedCount = todayLog.tasks.filter(t => t.completed).length;
  const totalCount = todayLog.tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const topStreak = state.streaks.reduce((a, b) => a.currentStreak > b.currentStreak ? a : b, state.streaks[0]);
  const isItikaf = state.mode.includes('itikaf');
  const modeLabel = state.mode.map(m => m === 'itikaf' ? "I'tikaf" : m === 'ramadan' ? 'Ramadan' : 'General').join(' + ');

  // Group tasks by time block
  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof todayLog.tasks> = {};
    for (const task of todayLog.tasks) {
      const block = task.timeBlock || 'morning';
      if (!groups[block]) groups[block] = [];
      groups[block].push(task);
    }
    return Object.entries(groups).sort(([a], [b]) => (TIME_BLOCK_ORDER[a] || 0) - (TIME_BLOCK_ORDER[b] || 0));
  }, [todayLog.tasks]);

  // Find next uncompleted task
  const nextTask = todayLog.tasks.find(t => !t.completed);

  const toggleBlock = (block: string) => {
    setExpandedBlocks(prev => ({ ...prev, [block]: !prev[block] }));
  };

  return (
    <div className="px-4 pt-6 space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs">Assalamu Alaikum,</p>
          <h1 className="text-xl font-bold gold-text gold-glow">{state.userName}</h1>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-primary justify-end">
            <Moon className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">
              {ramadanDay > 0 ? `Ramadan ${ramadanDay}` : `${hijriDate.day} ${hijriMonthName}`}
            </span>
          </div>
          <div className="flex items-center gap-1 justify-end text-[10px] text-muted-foreground">
            <Calendar className="w-2.5 h-2.5" />
            <span>{hijriMonthName} {hijriDate.year} AH</span>
          </div>
        </div>
      </div>

      {/* Progress Ring + Next Task */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-4 flex items-center gap-4"
      >
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="5" className="stroke-secondary" />
            <circle
              cx="40" cy="40" r="34" fill="none" strokeWidth="5"
              className="stroke-primary"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold gold-text">{progressPercent}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-xs font-medium">{completedCount}/{totalCount} tasks</p>
          {totalCount - completedCount === 0 ? (
            <p className="text-[10px] text-accent font-medium">MashaAllah! All done today! ✨</p>
          ) : nextTask ? (
            <div>
              <p className="text-[10px] text-muted-foreground">Next up:</p>
              <p className="text-xs font-medium truncate">{nextTask.title} · {nextTask.timeSlot}</p>
            </div>
          ) : null}
          <div className="flex items-center gap-1.5 pt-0.5">
            <Flame className="w-3.5 h-3.5 streak-fire" />
            <span className="text-[10px] font-medium">{topStreak.icon} {topStreak.currentStreak}d streak</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Link to="/quran" className="glass-card p-2.5 text-center hover:border-primary/30 transition-colors">
          <BookOpen className="w-3.5 h-3.5 mx-auto text-accent mb-0.5" />
          <p className="text-[10px] text-muted-foreground">Qur'an</p>
          <p className="text-xs font-semibold truncate">{SURAH_NAMES[state.quranProgress.currentSurah]}</p>
        </Link>
        <Link to="/dhikr" className="glass-card p-2.5 text-center hover:border-primary/30 transition-colors">
          <span className="text-sm">📿</span>
          <p className="text-[10px] text-muted-foreground">Dhikr</p>
          <p className="text-xs font-semibold">{todayLog.dhikr.reduce((s, d) => s + d.count, 0)}</p>
        </Link>
        <Link to="/streaks" className="glass-card p-2.5 text-center hover:border-primary/30 transition-colors">
          <Flame className="w-3.5 h-3.5 mx-auto streak-fire mb-0.5" />
          <p className="text-[10px] text-muted-foreground">Streak</p>
          <p className="text-xs font-semibold">{topStreak.currentStreak}d</p>
        </Link>
        <div className="glass-card p-2.5 text-center">
          <Trophy className="w-3.5 h-3.5 mx-auto text-primary mb-0.5" />
          <p className="text-[10px] text-muted-foreground">XP</p>
          <p className="text-xs font-semibold gold-text">{state.totalXp}</p>
        </div>
      </div>

      {/* Grouped Tasks by Time Block */}
      <div className="space-y-2">
        {groupedTasks.map(([block, tasks]) => {
          const info = TIME_BLOCK_LABELS[block];
          const blockCompleted = tasks.filter(t => t.completed).length;
          const isExpanded = expandedBlocks[block];

          return (
            <div key={block} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleBlock(block)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{info?.icon}</span>
                  <div>
                    <p className="text-xs font-semibold">{info?.label}</p>
                    <p className="text-[10px] text-muted-foreground">{info?.timeRange}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{blockCompleted}/{tasks.length}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-2 space-y-1">
                      {tasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all hover:bg-secondary/50 ${task.completed ? 'opacity-50' : ''
                            }`}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </p>
                            {task.timeSlot && (
                              <p className="text-[10px] text-muted-foreground">{task.timeSlot}</p>
                            )}
                          </div>
                          {task.streakEnabled && <Flame className="w-3 h-3 text-primary/40 flex-shrink-0" />}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${categoryColors[task.category] || ''}`}>
                            {task.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-2">
        <Link to="/guided/morning" className="glass-card p-3 flex items-center gap-2 hover:border-primary/30 transition-colors">
          <span className="text-lg">🌅</span>
          <div>
            <p className="text-xs font-semibold">Morning Adhkar</p>
            <p className="text-[10px] text-muted-foreground">Guided session</p>
          </div>
        </Link>
        <Link to="/guided/evening" className="glass-card p-3 flex items-center gap-2 hover:border-primary/30 transition-colors">
          <span className="text-lg">🌇</span>
          <div>
            <p className="text-xs font-semibold">Evening Adhkar</p>
            <p className="text-[10px] text-muted-foreground">Guided session</p>
          </div>
        </Link>
      </div>

      {/* Reflection - collapsed by default in I'tikaf mode */}
      {!isItikaf || reflection ? (
        <div className="glass-card p-3 space-y-2">
          <h2 className="text-xs font-semibold flex items-center gap-1.5">
            <PenLine className="w-3.5 h-3.5 text-primary" /> Reflection
          </h2>
          <textarea
            value={reflection}
            onChange={e => {
              setReflection(e.target.value);
              updateReflection(e.target.value);
            }}
            placeholder="What touched your heart today?"
            rows={2}
            className="w-full bg-secondary/50 rounded-lg p-2.5 text-xs resize-none border-none outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
          />
        </div>
      ) : null}
    </div>
  );
}
