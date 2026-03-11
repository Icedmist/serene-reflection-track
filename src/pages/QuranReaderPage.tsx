import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { BookOpen, ChevronLeft, ChevronRight, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SURAH_NAMES } from '@/lib/types';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

const XP_PER_AYAH = 2;
const XP_PER_SURAH = 50;

const BADGES = [
  { id: 'first_surah', name: 'First Step', icon: '🌱', desc: 'Read your first Surah', xp: 100, threshold: 1 },
  { id: 'five_surahs', name: 'Seeker', icon: '📖', desc: 'Read 5 Surahs', xp: 250, threshold: 5 },
  { id: 'ten_surahs', name: 'Dedicated', icon: '⭐', desc: 'Read 10 Surahs', xp: 500, threshold: 10 },
  { id: 'half_quran', name: 'Halfway', icon: '🌟', desc: 'Read 57 Surahs', xp: 1000, threshold: 57 },
  { id: 'full_quran', name: 'Khatm', icon: '👑', desc: 'Complete the Qur\'an', xp: 5000, threshold: 114 },
];

export default function QuranReaderPage() {
  const { state, updateQuranSurah } = useStore();
  const [surahNumber, setSurahNumber] = useState(state.quranProgress.currentSurah);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [readAyahs, setReadAyahs] = useState<Set<number>>(new Set());
  const [xpEarned, setXpEarned] = useState(0);
  const [showBadge, setShowBadge] = useState<typeof BADGES[0] | null>(null);

  const surahsRead = state.quranProgress.currentSurah - state.quranProgress.startSurah;

  useEffect(() => {
    fetchSurah(surahNumber);
  }, [surahNumber]);

  const fetchSurah = async (num: number) => {
    setLoading(true);
    setReadAyahs(new Set());
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${num}/ar.alafasy`);
      const data = await res.json();
      if (data.data?.ayahs) {
        setAyahs(data.data.ayahs.map((a: any) => ({
          number: a.number,
          text: a.text,
          numberInSurah: a.numberInSurah,
        })));
      }
    } catch {
      setAyahs([]);
    }
    setLoading(false);
  };

  const markAyahRead = (ayahNum: number) => {
    setReadAyahs(prev => {
      const next = new Set(prev);
      if (next.has(ayahNum)) {
        next.delete(ayahNum);
        setXpEarned(e => Math.max(0, e - XP_PER_AYAH));
      } else {
        next.add(ayahNum);
        setXpEarned(e => e + XP_PER_AYAH);
      }
      return next;
    });
  };

  const completeSurah = () => {
    updateQuranSurah(surahNumber + 1);
    setXpEarned(prev => prev + XP_PER_SURAH);

    // Check badges
    const newSurahsRead = surahsRead + 1;
    const earned = BADGES.find(b => b.threshold === newSurahsRead);
    if (earned) setShowBadge(earned);

    if (surahNumber < 114) setSurahNumber(surahNumber + 1);
  };

  const allRead = ayahs.length > 0 && readAyahs.size === ayahs.length;

  return (
    <div className="px-4 pt-6 space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold gold-text flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Qur'an Reader
        </h1>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold gold-text">{xpEarned} XP</span>
        </div>
      </div>

      {/* Surah Navigation */}
      <div className="glass-card p-4 flex items-center justify-between">
        <button
          onClick={() => setSurahNumber(Math.max(1, surahNumber - 1))}
          disabled={surahNumber <= 1}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-lg font-bold gold-text font-arabic">{SURAH_NAMES[surahNumber]}</p>
          <p className="text-xs text-muted-foreground">Surah {surahNumber} • {ayahs.length} Ayahs</p>
        </div>
        <button
          onClick={() => setSurahNumber(Math.min(114, surahNumber + 1))}
          disabled={surahNumber >= 114}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* XP Progress Bar */}
      <div className="glass-card p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Reading progress</span>
          <span className="font-medium">{readAyahs.size}/{ayahs.length} ayahs</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            animate={{ width: ayahs.length ? `${(readAyahs.size / ayahs.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Badges earned */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {BADGES.map(b => {
          const earned = surahsRead >= b.threshold;
          return (
            <div key={b.id} className={`flex-shrink-0 px-3 py-2 rounded-lg text-center min-w-[70px] ${
              earned ? 'bg-primary/15 border border-primary/30' : 'bg-secondary/50 opacity-40'
            }`}>
              <span className="text-lg">{b.icon}</span>
              <p className="text-[9px] text-muted-foreground mt-0.5">{b.name}</p>
            </div>
          );
        })}
      </div>

      {/* Badge popup */}
      {showBadge && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-6 text-center border-primary/50 space-y-2"
        >
          <Star className="w-8 h-8 mx-auto text-primary" />
          <span className="text-4xl">{showBadge.icon}</span>
          <h3 className="text-lg font-bold gold-text">{showBadge.name}</h3>
          <p className="text-xs text-muted-foreground">{showBadge.desc}</p>
          <p className="text-sm font-bold text-accent">+{showBadge.xp} XP</p>
          <button onClick={() => setShowBadge(null)} className="text-xs text-primary hover:underline">
            Continue Reading
          </button>
        </motion.div>
      )}

      {/* Ayahs */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading Surah...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ayahs.map(ayah => (
            <button
              key={ayah.number}
              onClick={() => markAyahRead(ayah.number)}
              className={`w-full text-right p-4 rounded-xl border transition-all ${
                readAyahs.has(ayah.number)
                  ? 'border-accent/30 bg-accent/5'
                  : 'border-border bg-card/50 hover:bg-card/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  readAyahs.has(ayah.number) ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {ayah.numberInSurah}
                </span>
                <p className="text-lg leading-loose font-arabic text-foreground flex-1">{ayah.text}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Complete Surah Button */}
      {allRead && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={completeSurah}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        >
          <Trophy className="w-5 h-5" />
          Complete Surah (+{XP_PER_SURAH} XP)
        </motion.button>
      )}
    </div>
  );
}
