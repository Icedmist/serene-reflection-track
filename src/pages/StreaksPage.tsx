import { useStore } from '@/lib/store';
import { Flame, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StreaksPage() {
  const { state } = useStore();
  const topStreak = state.streaks.reduce((a, b) => a.currentStreak > b.currentStreak ? a : b, state.streaks[0]);

  // Weekly consistency: check last 7 days
  const dayEntries = Object.entries(state.days).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);
  const weeklyAvg = dayEntries.length > 0
    ? Math.round(dayEntries.reduce((sum, [, log]) => sum + log.completionPercent, 0) / dayEntries.length)
    : 0;

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-lg font-bold gold-text flex items-center gap-2">
        <Flame className="w-5 h-5 streak-fire" /> Streaks & Insights
      </h1>

      {/* Overall */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 text-center space-y-1">
        <Flame className="w-8 h-8 mx-auto streak-fire" />
        <p className="text-3xl font-bold gold-text gold-glow">{topStreak.currentStreak}</p>
        <p className="text-xs text-muted-foreground">Best active streak ({topStreak.habit})</p>
      </motion.div>

      {/* All Streaks */}
      <div className="space-y-2">
        {state.streaks.map((s, i) => (
          <motion.div
            key={s.habit}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-3 flex items-center gap-3"
          >
            <span className="text-xl">{s.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold">{s.habit}</p>
              <div className="h-1 bg-secondary rounded-full overflow-hidden mt-1">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (s.currentStreak / Math.max(s.longestStreak, 1)) * 100)}%` }} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold gold-text">{s.currentStreak}</p>
              <p className="text-[9px] text-muted-foreground">best {s.longestStreak}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Consistency */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="text-xs font-semibold flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-accent" /> Weekly Consistency
        </h2>
        <div className="flex items-end gap-1.5 h-20">
          {dayEntries.reverse().map(([date, log], i) => {
            const dayOfWeek = new Date(date).getDay();
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-secondary rounded-sm overflow-hidden flex-1 flex flex-col-reverse">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${log.completionPercent}%` }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={`w-full rounded-sm ${log.completionPercent >= 80 ? 'bg-accent' : log.completionPercent >= 50 ? 'bg-primary' : 'bg-primary/50'}`}
                  />
                </div>
                <span className="text-[8px] text-muted-foreground">{weekDays[dayOfWeek]}</span>
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <p className="text-lg font-bold gold-text">{weeklyAvg}%</p>
          <p className="text-[10px] text-muted-foreground">7-day average</p>
        </div>
      </div>

      {/* XP Summary */}
      <div className="glass-card p-4 text-center space-y-1">
        <p className="text-[10px] text-muted-foreground">Total XP Earned</p>
        <p className="text-2xl font-bold gold-text gold-glow">{state.totalXp}</p>
      </div>
    </div>
  );
}
