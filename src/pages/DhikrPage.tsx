import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function DhikrPage() {
  const { todayLog, updateDhikr } = useStore();
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const handleIncrement = (id: string) => {
    updateDhikr(id, 1);
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 150);
  };

  const totalCount = todayLog.dhikr.reduce((s, d) => s + d.count, 0);
  const totalTarget = todayLog.dhikr.reduce((s, d) => s + d.target, 0);

  return (
    <div className="px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold gold-text">Dhikr & Du'a</h1>
        <div className="text-right">
          <p className="text-lg font-bold gold-text">{totalCount}</p>
          <p className="text-[10px] text-muted-foreground">of {totalTarget} target</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          animate={{ width: `${Math.min(100, (totalCount / totalTarget) * 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Counters */}
      <div className="space-y-3">
        {todayLog.dhikr.map((d) => {
          const percent = Math.min(100, (d.count / d.target) * 100);
          const isComplete = d.count >= d.target;
          const isAnimating = animatingId === d.id;

          return (
            <motion.div
              key={d.id}
              className={`glass-card p-4 ${isComplete ? 'border-accent/30' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold">{d.name}</p>
                  {d.nameAr && <p className="text-lg font-arabic text-muted-foreground">{d.nameAr}</p>}
                </div>
                <div className="text-right">
                  <motion.p
                    className={`text-2xl font-bold tabular-nums ${isComplete ? 'text-accent' : 'gold-text'}`}
                    animate={isAnimating ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.15 }}
                  >
                    {d.count}
                  </motion.p>
                  <p className="text-[10px] text-muted-foreground">/ {d.target}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-accent' : 'bg-primary'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => updateDhikr(d.id, -1)}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleIncrement(d.id)}
                  className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-lg"
                >
                  <Plus className="w-6 h-6" />
                </button>
                <button
                  onClick={() => updateDhikr(d.id, -d.count)}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
