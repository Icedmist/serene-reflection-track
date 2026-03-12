import { useStore } from '@/lib/store';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Circle, Sparkles } from 'lucide-react';

export default function GuidedAdhkarPage() {
  const { type } = useParams<{ type: 'morning' | 'evening' }>();
  const adhkarType = type === 'evening' ? 'evening' : 'morning';
  const { todayLog, updateAdhkar, markAdhkarSetComplete } = useStore();

  const adhkar = adhkarType === 'morning' ? todayLog.morningAdhkar : todayLog.eveningAdhkar;
  const items = adhkar || [];
  const completedCount = items.filter(a => a.completed).length;
  const totalCount = items.length;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <div className="px-4 pt-6 space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <Link to="/" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold gold-text">
            {adhkarType === 'morning' ? '🌅 Morning Adhkar' : '🌇 Evening Adhkar'}
          </h1>
          <p className="text-[10px] text-muted-foreground">Guided remembrance session</p>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold gold-text">{completedCount}/{totalCount}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            animate={{ width: totalCount ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {allDone && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-4 text-center border-accent/30 space-y-1"
        >
          <Sparkles className="w-6 h-6 mx-auto text-accent" />
          <p className="text-sm font-bold text-accent">Completed!</p>
          <p className="text-[10px] text-muted-foreground">MashaAllah, you've completed your {adhkarType} adhkar.</p>
        </motion.div>
      )}

      {/* Microtasks */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`glass-card p-3.5 transition-all ${item.completed ? 'opacity-60 border-accent/20' : ''}`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => updateAdhkar(adhkarType, item.id, item.completed ? -item.count : (item.target - item.count))}
                className="mt-0.5 flex-shrink-0"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {item.title}
                </p>
                {item.titleAr && (
                  <p className="text-base font-arabic text-muted-foreground mt-0.5 text-right">{item.titleAr}</p>
                )}
                {item.target > 1 && !item.completed && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateAdhkar(adhkarType, item.id, -1)}
                      className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold"
                    >−</button>
                    <span className="text-xs font-semibold tabular-nums min-w-[40px] text-center">{item.count}/{item.target}</span>
                    <button
                      onClick={() => updateAdhkar(adhkarType, item.id, 1)}
                      className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold"
                    >+</button>
                    <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(item.count / item.target) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!allDone && totalCount > 0 && (
        <button
          onClick={() => markAdhkarSetComplete(adhkarType)}
          className="w-full py-3 bg-secondary text-foreground rounded-xl font-medium text-xs hover:bg-secondary/80 transition-colors"
        >
          Mark All Completed
        </button>
      )}
    </div>
  );
}
