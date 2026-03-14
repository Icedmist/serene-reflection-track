import { useStore } from '@/lib/store';
import { SURAH_NAMES } from '@/lib/types';
import { BookOpen, ChevronUp, ChevronDown, Target, BookMarked } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HijriUtils } from '@/lib/hijri-utils';

export default function QuranTracker() {
  const { state, updateQuranSurah } = useStore();
  const { quranProgress } = state;
  const progress = ((quranProgress.currentSurah - quranProgress.startSurah) / (114 - quranProgress.startSurah + 1)) * 100;
  const surahsRead = quranProgress.currentSurah - quranProgress.startSurah;
  const surahsRemaining = 114 - quranProgress.currentSurah;

  const ramadanDay = HijriUtils.getRamadanDay(new Date(), state.hijriOffset);
  const daysLeft = ramadanDay > 0 ? (30 - ramadanDay) : 0;
  const dailyTarget = daysLeft > 0 ? Math.ceil(surahsRemaining / daysLeft) : surahsRemaining;

  const hasResumePoint = quranProgress.currentAyah > 1;

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold gold-text flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Qur'an Progress
        </h1>
        <Link to="/quran/read" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
          <BookMarked className="w-3.5 h-3.5" /> {hasResumePoint ? 'Resume' : 'Read'}
        </Link>
      </div>

      {hasResumePoint && (
        <div className="glass-card p-3 text-center border-primary/20">
          <p className="text-[10px] text-muted-foreground">Resume from</p>
          <p className="text-sm font-semibold gold-text">{SURAH_NAMES[quranProgress.currentSurah]} · Ayah {quranProgress.currentAyah}</p>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 space-y-3">
        <div className="text-center space-y-0.5">
          <p className="text-[10px] text-muted-foreground">Currently Reading</p>
          <p className="text-xl font-bold gold-text gold-glow font-arabic">{SURAH_NAMES[quranProgress.currentSurah]}</p>
          <p className="text-xs text-muted-foreground">Surah {quranProgress.currentSurah} of 114</p>
        </div>

        <div className="space-y-1">
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>{SURAH_NAMES[quranProgress.startSurah]}</span>
            <span>{Math.round(progress)}%</span>
            <span>An-Nas</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1">
          <button onClick={() => updateQuranSurah(quranProgress.currentSurah - 1)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="text-center min-w-[100px]">
            <p className="text-2xl font-bold gold-text">{quranProgress.currentSurah}</p>
            <p className="text-[10px] text-muted-foreground">Current</p>
          </div>
          <button onClick={() => updateQuranSurah(quranProgress.currentSurah + 1)} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card p-3 text-center">
          <p className="text-xl font-bold text-accent">{surahsRead}</p>
          <p className="text-[10px] text-muted-foreground">Read</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-xl font-bold gold-text">{surahsRemaining}</p>
          <p className="text-[10px] text-muted-foreground">Remaining</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-xl font-bold text-foreground">{daysLeft}</p>
          <p className="text-[10px] text-muted-foreground">Days Left</p>
        </div>
        <div className="glass-card p-3 text-center flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-primary" />
            <p className="text-xl font-bold gold-text">{dailyTarget}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Per Day</p>
        </div>
      </div>

      <div className="glass-card p-3.5 space-y-2.5">
        <h2 className="text-xs font-semibold">Journey</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="text-muted-foreground">Started:</span>
          <span className="font-medium">{SURAH_NAMES[quranProgress.startSurah]}</span>
        </div>
        <div className="ml-1 border-l-2 border-dashed border-primary/30 h-5" />
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-gold" />
          <span className="text-muted-foreground">Now:</span>
          <span className="font-medium gold-text">{SURAH_NAMES[quranProgress.currentSurah]}</span>
        </div>
        <div className="ml-1 border-l-2 border-dashed border-muted-foreground/20 h-5" />
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary border border-border" />
          <span className="text-muted-foreground">Goal:</span>
          <span className="font-medium">An-Nas (114)</span>
        </div>
      </div>
    </div>
  );
}
