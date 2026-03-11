import { useStore } from '@/lib/store';
import { SURAH_NAMES } from '@/lib/types';
import { BookOpen, ChevronUp, ChevronDown, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuranTracker() {
  const { state, updateQuranSurah } = useStore();
  const { quranProgress } = state;
  const progress = ((quranProgress.currentSurah - quranProgress.startSurah) / (114 - quranProgress.startSurah + 1)) * 100;
  const surahsRead = quranProgress.currentSurah - quranProgress.startSurah;
  const surahsRemaining = 114 - quranProgress.currentSurah;
  const daysLeft = 30 - state.currentRamadanDay;
  const dailyTarget = daysLeft > 0 ? Math.ceil(surahsRemaining / daysLeft) : surahsRemaining;

  return (
    <div className="px-4 pt-6 space-y-5">
      <h1 className="text-xl font-bold gold-text flex items-center gap-2">
        <BookOpen className="w-5 h-5" /> Qur'an Progress
      </h1>

      {/* Main Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 space-y-4"
      >
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">Currently Reading</p>
          <p className="text-2xl font-bold gold-text gold-glow font-arabic">
            {SURAH_NAMES[quranProgress.currentSurah]}
          </p>
          <p className="text-sm text-muted-foreground">Surah {quranProgress.currentSurah} of 114</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{SURAH_NAMES[quranProgress.startSurah]}</span>
            <span>{Math.round(progress)}% complete</span>
            <span>An-Nas</span>
          </div>
        </div>

        {/* Surah navigator */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => updateQuranSurah(quranProgress.currentSurah - 1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <div className="text-center min-w-[120px]">
            <p className="text-3xl font-bold gold-text">{quranProgress.currentSurah}</p>
            <p className="text-xs text-muted-foreground">Current Surah</p>
          </div>
          <button
            onClick={() => updateQuranSurah(quranProgress.currentSurah + 1)}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-accent">{surahsRead}</p>
          <p className="text-xs text-muted-foreground">Surahs Read</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold gold-text">{surahsRemaining}</p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{daysLeft}</p>
          <p className="text-xs text-muted-foreground">Days Left</p>
        </div>
        <div className="glass-card p-4 text-center flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-primary" />
            <p className="text-2xl font-bold gold-text">{dailyTarget}</p>
          </div>
          <p className="text-xs text-muted-foreground">Surahs/Day Needed</p>
        </div>
      </div>

      {/* Journey path */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Your Journey</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">Started from</span>
          <span className="font-medium">{SURAH_NAMES[quranProgress.startSurah]}</span>
        </div>
        <div className="ml-1.5 border-l-2 border-dashed border-primary/30 h-8" />
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-primary animate-pulse-gold" />
          <span className="text-muted-foreground">Now at</span>
          <span className="font-medium gold-text">{SURAH_NAMES[quranProgress.currentSurah]}</span>
        </div>
        <div className="ml-1.5 border-l-2 border-dashed border-muted-foreground/20 h-8" />
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-secondary border border-border" />
          <span className="text-muted-foreground">Goal</span>
          <span className="font-medium">An-Nas (114)</span>
        </div>
      </div>
    </div>
  );
}
