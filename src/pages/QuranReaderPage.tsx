import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { BookOpen, ChevronLeft, ChevronRight, Trophy, Star, Play, Pause, Square, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { SURAH_NAMES } from '@/lib/types';
import { Link } from 'react-router-dom';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

const XP_PER_AYAH = 2;
const XP_PER_SURAH = 50;
const AVG_LETTERS_PER_AYAH = 80;

const BADGES = [
  { id: 'first_surah', name: 'First Step', icon: '🌱', desc: 'Read your first Surah', xp: 100, threshold: 1 },
  { id: 'five_surahs', name: 'Seeker', icon: '📖', desc: 'Read 5 Surahs', xp: 250, threshold: 5 },
  { id: 'ten_surahs', name: 'Dedicated', icon: '⭐', desc: 'Read 10 Surahs', xp: 500, threshold: 10 },
  { id: 'half_quran', name: 'Halfway', icon: '🌟', desc: 'Read 57 Surahs', xp: 1000, threshold: 57 },
  { id: 'full_quran', name: 'Khatm', icon: '👑', desc: 'Complete the Qur\'an', xp: 5000, threshold: 114 },
];

export default function QuranReaderPage() {
  const { state, updateQuranSurah, saveQuranStopPoint, startQuranSession, pauseQuranSession, resumeQuranSession, completeQuranSession, addXp } = useStore();
  const [surahNumber, setSurahNumber] = useState(state.quranProgress.currentSurah);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [readAyahs, setReadAyahs] = useState<Set<number>>(new Set());
  const [sessionXp, setSessionXp] = useState(0);
  const [showBadge, setShowBadge] = useState<typeof BADGES[0] | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const surahsRead = state.quranProgress.currentSurah - state.quranProgress.startSurah;
  const estimatedLetters = readAyahs.size * AVG_LETTERS_PER_AYAH;

  useEffect(() => {
    fetchSurah(surahNumber);
  }, [surahNumber]);

  useEffect(() => {
    if (sessionActive && !sessionPaused) {
      timerRef.current = setInterval(() => setSessionDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionActive, sessionPaused]);

  const fetchSurah = async (num: number) => {
    setLoading(true);
    setReadAyahs(new Set());
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${num}/ar.alafasy`);
      const data = await res.json();
      if (data.data?.ayahs) {
        setAyahs(data.data.ayahs.map((a: any) => ({ number: a.number, text: a.text, numberInSurah: a.numberInSurah })));
      }
    } catch { setAyahs([]); }
    setLoading(false);
  };

  const handleStartSession = () => {
    setSessionActive(true);
    setSessionPaused(false);
    setSessionDuration(0);
    setSessionXp(0);
    startQuranSession(surahNumber, 1);
  };

  const handlePauseResume = () => {
    if (sessionPaused) {
      setSessionPaused(false);
      resumeQuranSession();
    } else {
      setSessionPaused(true);
      pauseQuranSession();
    }
  };

  const handleSaveStop = () => {
    const lastRead = Math.max(...Array.from(readAyahs), 0);
    const ayah = ayahs.find(a => a.number === lastRead);
    saveQuranStopPoint(surahNumber, ayah?.numberInSurah || 1);
  };

  const handleFinishSession = () => {
    setSessionActive(false);
    setSessionPaused(false);
    addXp(sessionXp);
    completeQuranSession(readAyahs.size);
  };

  const markAyahRead = (ayahNum: number) => {
    if (!sessionActive || sessionPaused) return;
    setReadAyahs(prev => {
      const next = new Set(prev);
      if (next.has(ayahNum)) {
        next.delete(ayahNum);
        setSessionXp(e => Math.max(0, e - XP_PER_AYAH));
      } else {
        next.add(ayahNum);
        setSessionXp(e => e + XP_PER_AYAH);
      }
      return next;
    });
  };

  const completeSurah = () => {
    updateQuranSurah(surahNumber + 1);
    setSessionXp(prev => prev + XP_PER_SURAH);
    const newSurahsRead = surahsRead + 1;
    const earned = BADGES.find(b => b.threshold === newSurahsRead);
    if (earned) setShowBadge(earned);
    if (surahNumber < 114) setSurahNumber(surahNumber + 1);
  };

  const allRead = ayahs.length > 0 && readAyahs.size === ayahs.length;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-4 pt-6 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/quran" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-bold gold-text flex items-center gap-2 flex-1">
          <BookOpen className="w-4 h-4" /> Qur'an Reader
        </h1>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold gold-text">{sessionXp} XP</span>
        </div>
      </div>

      {/* Surah Navigation */}
      <div className="glass-card p-3 flex items-center justify-between">
        <button onClick={() => setSurahNumber(Math.max(1, surahNumber - 1))} disabled={surahNumber <= 1} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-base font-bold gold-text font-arabic">{SURAH_NAMES[surahNumber]}</p>
          <p className="text-[10px] text-muted-foreground">Surah {surahNumber} • {ayahs.length} Ayahs</p>
        </div>
        <button onClick={() => setSurahNumber(Math.min(114, surahNumber + 1))} disabled={surahNumber >= 114} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Session Controls */}
      {!sessionActive ? (
        <div className="space-y-2">
          <button onClick={handleStartSession} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <Play className="w-4 h-4" /> Start Reading Session
          </button>
          {state.quranProgress.currentAyah > 1 && (
            <p className="text-[10px] text-center text-muted-foreground">
              Resume from Surah {SURAH_NAMES[state.quranProgress.currentSurah]}, Ayah {state.quranProgress.currentAyah}
            </p>
          )}
        </div>
      ) : null}

      {/* Reward Encouragement */}
      {readAyahs.size > 0 && (
        <div className="glass-card p-3 text-center space-y-0.5">
          <p className="text-[10px] text-muted-foreground">
            Estimated encouragement counter based on the teaching that each letter earns reward. <em>Allah knows best.</em>
          </p>
          <p className="text-sm font-bold gold-text">~{estimatedLetters.toLocaleString()} letters read</p>
        </div>
      )}

      {/* Badges */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {BADGES.map(b => {
          const earned = surahsRead >= b.threshold;
          return (
            <div key={b.id} className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-center min-w-[60px] ${earned ? 'bg-primary/15 border border-primary/30' : 'bg-secondary/50 opacity-40'}`}>
              <span className="text-sm">{b.icon}</span>
              <p className="text-[8px] text-muted-foreground">{b.name}</p>
            </div>
          );
        })}
      </div>

      {/* Badge popup */}
      {showBadge && (
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-5 text-center border-primary/50 space-y-2">
          <Star className="w-6 h-6 mx-auto text-primary" />
          <span className="text-3xl">{showBadge.icon}</span>
          <h3 className="text-base font-bold gold-text">{showBadge.name}</h3>
          <p className="text-[10px] text-muted-foreground">{showBadge.desc}</p>
          <p className="text-xs font-bold text-accent">+{showBadge.xp} XP</p>
          <button onClick={() => setShowBadge(null)} className="text-[10px] text-primary hover:underline">Continue</button>
        </motion.div>
      )}

      {/* Ayahs */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground mt-2">Loading Surah...</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {ayahs.map(ayah => (
            <button
              key={ayah.number}
              onClick={() => markAyahRead(ayah.number)}
              disabled={!sessionActive || sessionPaused}
              className={`w-full text-right p-3 rounded-xl border transition-all ${
                readAyahs.has(ayah.number)
                  ? 'border-accent/30 bg-accent/5'
                  : 'border-border bg-card/50 hover:bg-card/80'
              } ${(!sessionActive || sessionPaused) ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  readAyahs.has(ayah.number) ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
                }`}>{ayah.numberInSurah}</span>
                <p className="text-base leading-loose font-arabic text-foreground flex-1">{ayah.text}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {allRead && sessionActive && (
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={completeSurah}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4" /> Complete Surah (+{XP_PER_SURAH} XP)
        </motion.button>
      )}

      {/* Sticky Progress Strip */}
      {sessionActive && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-4 py-2.5">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold truncate">{SURAH_NAMES[surahNumber]}</span>
                <span className="text-[10px] text-muted-foreground">{readAyahs.size}/{ayahs.length} ayahs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(sessionDuration)}</span>
                <span className="text-[10px] font-bold gold-text">{sessionXp}XP</span>
              </div>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: ayahs.length ? `${(readAyahs.size / ayahs.length) * 100}%` : '0%' }} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePauseResume} className="flex-1 py-1.5 bg-secondary rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                {sessionPaused ? <><Play className="w-3 h-3" /> Resume</> : <><Pause className="w-3 h-3" /> Pause</>}
              </button>
              <button onClick={handleSaveStop} className="py-1.5 px-3 bg-secondary rounded-lg text-xs font-medium flex items-center gap-1">
                <Bookmark className="w-3 h-3" /> Save
              </button>
              <button onClick={handleFinishSession} className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                <Square className="w-3 h-3" /> Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
