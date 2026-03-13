import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Flame, TrendingUp, Share2, Trophy, Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { SURAH_NAMES } from '@/lib/types';

export default function StreaksPage() {
  const { state, todayLog } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const topStreak = state.streaks.length > 0
    ? state.streaks.reduce((a, b) => a.currentStreak > b.currentStreak ? a : b, state.streaks[0])
    : { habit: 'None', currentStreak: 0, longestStreak: 0, icon: '🔥' };

  // Weekly consistency
  const dayEntries = Object.entries(state.days).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);
  const weeklyAvg = dayEntries.length > 0
    ? Math.round(dayEntries.reduce((sum, [, log]) => sum + log.completionPercent, 0) / dayEntries.length)
    : 0;

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const handleShareStreaks = async () => {
    if (!shareCardRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, { pixelRatio: 3, backgroundColor: '#0f172a' });

      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'ibadahtrack-streaks.png', { type: 'image/png' });
        await navigator.share({ title: 'My IbadahTrack Streaks', files: [file] });
      } else {
        const link = document.createElement('a');
        link.download = 'ibadahtrack-streaks.png';
        link.href = dataUrl;
        link.click();
        toast.success('Streak card downloaded!');
      }
    } catch (e) {
      // User cancelled share or error
      const link = document.createElement('a');
      const dataUrl = await toPng(shareCardRef.current!, { pixelRatio: 3, backgroundColor: '#0f172a' });
      link.download = 'ibadahtrack-streaks.png';
      link.href = dataUrl;
      link.click();
      toast.success('Streak card downloaded!');
    }
    setSharing(false);
  };

  const handleCopyShareText = () => {
    const text = `🔥 My IbadahTrack Streaks:\n${state.streaks.map(s => `${s.icon} ${s.habit}: ${s.currentStreak} days`).join('\n')}\n\n📊 Weekly avg: ${weeklyAvg}%\n⭐ Total XP: ${state.totalXp}\n\n#IbadahTrack`;
    navigator.clipboard.writeText(text);
    toast.success('Streak summary copied!');
  };

  return (
    <div className="px-4 pt-6 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold gold-text flex items-center gap-2">
          <Flame className="w-5 h-5 streak-fire" /> Streaks & Insights
        </h1>
        <button
          onClick={handleShareStreaks}
          disabled={sharing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          <Share2 className="w-3.5 h-3.5" />
          {sharing ? 'Sharing...' : 'Share'}
        </button>
      </div>

      {/* Shareable Card (hidden off-screen for capture) */}
      <div className="overflow-hidden" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div
          ref={shareCardRef}
          className="p-6 space-y-4"
          style={{
            width: 400,
            background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #16213e 100%)',
            color: '#e5e0d8',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 14, fontWeight: 700, color: '#d4a843' }}>🔥 IbadahTrack Streaks</span>
            <span style={{ fontSize: 11, color: '#a0937d' }}>{state.userName}</span>
          </div>
          {state.streaks.map(s => (
            <div key={s.habit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px' }}>
              <span style={{ fontSize: 13 }}>{s.icon} {s.habit}</span>
              <span style={{ fontWeight: 700, color: '#d4a843' }}>{s.currentStreak} days</span>
            </div>
          ))}
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#d4a843' }}>{state.totalXp} XP</span>
            <p style={{ fontSize: 10, color: '#666', marginTop: 4 }}>بسم الله الرحمن الرحيم • IbadahTrack</p>
          </div>
        </div>
      </div>

      {/* Overall Best Streak */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 text-center space-y-1">
        <Flame className="w-8 h-8 mx-auto streak-fire" />
        <p className="text-3xl font-bold gold-text gold-glow">{topStreak.currentStreak}</p>
        <p className="text-xs text-muted-foreground">Best active streak ({topStreak.habit})</p>
      </motion.div>

      {/* All Streaks - Interactive */}
      <div className="space-y-2">
        {state.streaks.map((s, i) => (
          <motion.div
            key={s.habit}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:bg-card/90 transition-colors active:scale-[0.98]"
            onClick={() => {
              if (s.habit.toLowerCase().includes('qur')) navigate('/quran');
              else if (s.habit.toLowerCase().includes('adhkar') || s.habit.toLowerCase().includes('dhikr')) navigate('/dhikr');
              else navigate('/');
            }}
          >
            <span className="text-xl">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{s.habit}</p>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (s.currentStreak / Math.max(s.longestStreak, 1)) * 100)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold gold-text">{s.currentStreak}</p>
              <p className="text-[9px] text-muted-foreground">best {s.longestStreak}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* Weekly Consistency */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="text-xs font-semibold flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-accent" /> Weekly Consistency
        </h2>
        <div className="flex items-end gap-1.5 h-20">
          {dayEntries.length > 0 ? (
            [...dayEntries].reverse().map(([date, log], i) => {
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
            })
          ) : (
            <p className="text-xs text-muted-foreground w-full text-center py-6">No data yet — complete today's tasks!</p>
          )}
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

      {/* Quick Share Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleShareStreaks}
          disabled={sharing}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Share2 className="w-4 h-4" />
          Download Card
        </button>
        <button
          onClick={handleCopyShareText}
          className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl py-3 font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Copy Text
        </button>
      </div>

      {/* Community Section Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 cursor-pointer hover:bg-card/90 transition-colors active:scale-[0.98]"
        onClick={() => navigate('/community')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Community</p>
            <p className="text-[10px] text-muted-foreground">View leaderboard & encourage others</p>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-primary" />
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
