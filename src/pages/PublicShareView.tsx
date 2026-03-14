import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/lib/db';
import { Moon, BookOpen, Flame, CheckCircle2, UserPlus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { HijriUtils } from '@/lib/hijri-utils';

interface ShareData {
  displayName: string;
  mode: string;
  ramadanDay: number;
  hijriDate: { day: number; month: number; year: number };
  hijriMonthName: string;
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

    const allUsers = await db.users.toArray();
    const profile = allUsers[0];

    if (profile) {
      const hDate = HijriUtils.getHijriParts(new Date(), profile.hijri_offset || 0);
      setData({
        displayName: profile.name || 'A Muslim',
        mode: profile.mode || 'ramadan',
        ramadanDay: HijriUtils.getRamadanDay(new Date(), profile.hijri_offset || 0),
        hijriDate: hDate,
        hijriMonthName: HijriUtils.getMonthName(hDate.month),
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
              <p className="text-sm font-bold truncate">
                {data.ramadanDay > 0 ? `Ramadan ${data.ramadanDay}` : `${data.hijriDate.day} ${data.hijriMonthName}`}
              </p>
              <div className="flex items-center gap-1 justify-center text-[8px] text-muted-foreground">
                <Calendar className="w-2 h-2" />
                <span>{data.hijriMonthName} {data.hijriDate.year}</span>
              </div>
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
