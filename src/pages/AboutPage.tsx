import { Moon, Mail, ExternalLink, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="px-4 pt-6 space-y-6 pb-8">
      <h1 className="text-xl font-bold gold-text flex items-center gap-2">
        <Heart className="w-5 h-5" /> About
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center space-y-4"
      >
        <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Moon className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold gold-text gold-glow">IbadahTrack</h2>
          <p className="text-sm text-muted-foreground mt-1">Your Ramadan Worship Companion</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          IbadahTrack helps you stay consistent in your worship during Ramadan and I'tikaf.
          Track your prayers, Qur'an recitation, dhikr, and build meaningful streaks.
          Share your journey as Sadaqah Jariyah to inspire others.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold">Developer</h3>
        <div className="space-y-3">
          <div>
            <p className="text-base font-bold text-foreground">Abdulrasheed Mahmud Bello</p>
            <p className="text-sm text-primary font-medium">CEO, NEXA Digital Solutions</p>
          </div>
          <a
            href="mailto:abdoolgramng@gmail.com"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
            abdoolgramng@gmail.com
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 space-y-3"
      >
        <h3 className="text-sm font-semibold">Features</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {[
            '🌙 Ramadan & I\'tikaf modes',
            '📖 Qur\'an reader & tracker',
            '📿 Dhikr counters',
            '🔥 Streak tracking',
            '📅 Calendar view',
            '🏆 XP & badges',
            '📤 Share cards',
            '⏰ Reminders',
          ].map(f => (
            <div key={f} className="bg-secondary/50 rounded-lg p-2">{f}</div>
          ))}
        </div>
      </motion.div>

      <div className="text-center space-y-2 py-4">
        <p className="text-xs text-muted-foreground">Built with ❤️ for the Ummah</p>
        <p className="text-lg font-arabic text-muted-foreground">بسم الله الرحمن الرحيم</p>
        <p className="text-[10px] text-muted-foreground">Version 1.0.0</p>
      </div>
    </div>
  );
}
