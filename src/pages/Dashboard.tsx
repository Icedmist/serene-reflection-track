import { useStore } from '@/lib/store';
import { SURAH_NAMES } from '@/lib/types';
import { motion } from 'framer-motion';
import { Moon, Flame, BookOpen, CheckCircle2, Circle, PenLine, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

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
  const completedCount = todayLog.tasks.filter(t => t.completed).length;
  const totalCount = todayLog.tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const topStreak = state.streaks.reduce((a, b) => a.currentStreak > b.currentStreak ? a : b, state.streaks[0]);

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Assalamu Alaikum,</p>
          <h1 className="text-2xl font-bold gold-text gold-glow">{state.userName}</h1>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-primary">
            <Moon className="w-4 h-4" />
            <span className="text-sm font-semibold">Ramadan Day {state.currentRamadanDay}</span>
          </div>
          <span className="text-xs text-muted-foreground capitalize">{state.mode} mode</span>
        </div>
      </div>

      {/* Progress Ring */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-5 flex items-center gap-5"
      >
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-secondary" />
            <circle
              cx="40" cy="40" r="34" fill="none" strokeWidth="6"
              className="stroke-primary"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold gold-text">{progressPercent}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">{completedCount} of {totalCount} tasks done</p>
          <p className="text-xs text-muted-foreground">
            {totalCount - completedCount === 0 ? 'MashaAllah! All done today!' : `${totalCount - completedCount} remaining`}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Flame className="w-4 h-4 streak-fire" />
            <span className="text-xs font-medium">{topStreak.icon} {topStreak.habit}: {topStreak.currentStreak} day streak</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/quran" className="glass-card p-3 text-center hover:border-primary/30 transition-colors">
          <BookOpen className="w-4 h-4 mx-auto text-accent mb-1" />
          <p className="text-xs text-muted-foreground">Qur'an</p>
          <p className="text-sm font-semibold">{SURAH_NAMES[state.quranProgress.currentSurah]}</p>
        </Link>
        <Link to="/dhikr" className="glass-card p-3 text-center hover:border-primary/30 transition-colors">
          <span className="text-lg">📿</span>
          <p className="text-xs text-muted-foreground">Dhikr</p>
          <p className="text-sm font-semibold">{todayLog.dhikr.reduce((s, d) => s + d.count, 0)}</p>
        </Link>
        <div className="glass-card p-3 text-center">
          <Flame className="w-4 h-4 mx-auto streak-fire mb-1" />
          <p className="text-xs text-muted-foreground">Top Streak</p>
          <p className="text-sm font-semibold">{topStreak.currentStreak}d</p>
        </div>
      </div>

      {/* Streaks */}
      <div className="glass-card p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 streak-fire" /> Active Streaks
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {state.streaks.map(s => (
            <div key={s.habit} className="flex-shrink-0 bg-secondary/50 rounded-lg px-3 py-2 text-center min-w-[80px]">
              <span className="text-lg">{s.icon}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{s.habit}</p>
              <p className="text-base font-bold gold-text">{s.currentStreak}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent" /> Today's Worship
        </h2>
        {todayLog.tasks.map((task, i) => (
          <motion.button
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => toggleTask(task.id)}
            className={`w-full flex items-center gap-3 glass-card px-4 py-3 text-left transition-all ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </p>
              {task.timeSlot && (
                <p className="text-xs text-muted-foreground">{task.timeSlot}</p>
              )}
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[task.category] || ''}`}>
              {task.category}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Reflection */}
      <div className="glass-card p-4 space-y-2">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <PenLine className="w-4 h-4 text-primary" /> Reflection
        </h2>
        <textarea
          value={reflection}
          onChange={e => {
            setReflection(e.target.value);
            updateReflection(e.target.value);
          }}
          placeholder="What touched your heart today?"
          rows={3}
          className="w-full bg-secondary/50 rounded-lg p-3 text-sm resize-none border-none outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  );
}
