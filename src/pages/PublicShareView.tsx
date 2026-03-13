import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/lib/db';
import { Moon, BookOpen, Flame, CheckCircle2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';

interface ShareData {
  displayName: string;
  mode: string;
  currentRamadanDay: number;
  totalXp: number;
  shareType: string;
}

export default function PublicShareView() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShareData();
  }, [code]);

  const loadShareData = async () => {
    if (!code) { setError('Invalid link'); setLoading(false); return; }

    // Since we are now "built-in" and local-only, we'll just show the *current* user's profile
    // OR if we wanted to support multiple local accounts, we can find a user.
    // For this context, we'll try to find a user with this 'name' or just show the logged in user as a placeholder.
    const allUsers = await db.users.toArray();
    const profile = allUsers[0]; // Just take the first one or the logged in one

    if (profile) {
      setData({
        displayName: profile.name || 'A Muslim',
        mode: profile.mode || 'ramadan',
        currentRamadanDay: profile.current_ramadan_day || 1,
        totalXp: profile.total_xp || 0,
        shareType: 'summary',
      });
    } else {
      setError('Profile not found');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <Moon className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold mb-2">Link Not Found</h1>
        <p className="text-sm text-muted-foreground">{error || 'This share link may have expired.'}</p>
        <a href="/" className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
          Start Your Own Journey
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pattern-overlay flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Moon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold gold-text gold-glow">IbadahTrack</h1>
        </div>

        <div className="glass-card p-6 space-y-4 text-center">
          <p className="text-muted-foreground text-sm">Worship journey of</p>
          <h2 className="text-2xl font-bold gold-text">{data.displayName}</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Moon className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">Day {data.currentRamadanDay}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{data.mode}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Flame className="w-5 h-5 mx-auto streak-fire mb-1" />
              <p className="text-lg font-bold gold-text">{data.totalXp} XP</p>
              <p className="text-[10px] text-muted-foreground">Total earned</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Inspired? Start your own tracking journey!</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-4 h-4" /> Join IbadahTrack
          </a>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          بسم الله الرحمن الرحيم • Shared as Sadaqah Jariyah
        </p>
      </motion.div>
    </div>
  );
}
