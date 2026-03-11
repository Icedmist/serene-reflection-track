import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { Moon, BookOpen, Bell, Share2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = ['mode', 'quran', 'sharing', 'reminders'] as const;

export default function OnboardingPage() {
  const { user, isGuest } = useAuth();
  const { state, setState } = useStore();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'ramadan' | 'itikaf' | 'general'>('itikaf');
  const [quranStyle, setQuranStyle] = useState<'surah' | 'juz'>('surah');
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [reminders, setReminders] = useState({ fajr: true, quran: true, dhikr: false, tahajjud: true });

  const currentStep = steps[step];

  const handleComplete = async () => {
    // Update local state
    setState(prev => ({
      ...prev,
      mode,
      onboarded: true,
      sharingEnabled,
      quranProgress: { ...prev.quranProgress, trackingStyle: quranStyle },
    }));

    // Save to DB if authenticated
    if (user) {
      await supabase.from('profiles').update({
        mode,
        quran_tracking_style: quranStyle,
        sharing_enabled: sharingEnabled,
        reminder_fajr: reminders.fajr,
        reminder_quran: reminders.quran,
        reminder_dhikr: reminders.dhikr,
        reminder_tahajjud: reminders.tahajjud,
        onboarded: true,
      }).eq('user_id', user.id);
    }
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleComplete();
  };

  return (
    <div className="min-h-screen bg-background pattern-overlay flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Progress */}
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {currentStep === 'mode' && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <Moon className="w-10 h-10 mx-auto text-primary" />
                  <h2 className="text-xl font-bold">Welcome to IbadahTrack</h2>
                  <p className="text-sm text-muted-foreground">How are you using this app?</p>
                </div>
                {([['ramadan', '🌙 Ramadan Mode', 'Track daily worship during Ramadan'],
                  ['itikaf', '🕌 I\'tikaf Mode', 'Full schedule for mosque retreat'],
                  ['general', '📿 General', 'Year-round worship tracking']] as const).map(([value, label, desc]) => (
                  <button
                    key={value}
                    onClick={() => setMode(value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      mode === value ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 'quran' && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <BookOpen className="w-10 h-10 mx-auto text-accent" />
                  <h2 className="text-xl font-bold">Qur'an Tracking</h2>
                  <p className="text-sm text-muted-foreground">How do you track your recitation?</p>
                </div>
                {([['surah', '📖 By Surah', 'Track which Surah you\'re reading'],
                  ['juz', '📕 By Juz', 'Track by Juz (para) number']] as const).map(([value, label, desc]) => (
                  <button
                    key={value}
                    onClick={() => setQuranStyle(value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      quranStyle === value ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 'sharing' && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <Share2 className="w-10 h-10 mx-auto text-primary" />
                  <h2 className="text-xl font-bold">Sharing</h2>
                  <p className="text-sm text-muted-foreground">Want to share progress as Sadaqah Jariyah?</p>
                </div>
                {([
                  [true, '🌍 Public Sharing', 'Share your journey and inspire others'],
                  [false, '🔒 Private Only', 'Keep everything personal'],
                ] as const).map(([value, label, desc]) => (
                  <button
                    key={String(value)}
                    onClick={() => setSharingEnabled(value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      sharingEnabled === value ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 'reminders' && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <Bell className="w-10 h-10 mx-auto text-primary" />
                  <h2 className="text-xl font-bold">Reminders</h2>
                  <p className="text-sm text-muted-foreground">Which reminders would you like?</p>
                </div>
                {([
                  ['fajr', '🌅 Fajr Prayer', '4:30 AM'],
                  ['tahajjud', '🌙 Tahajjud', '1:00 AM'],
                  ['quran', '📖 Qur\'an Session', '5:30 AM'],
                  ['dhikr', '📿 Dhikr Time', '1:00 PM'],
                ] as const).map(([key, label, time]) => (
                  <button
                    key={key}
                    onClick={() => setReminders(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                      reminders[key as keyof typeof reminders] ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{time}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      reminders[key as keyof typeof reminders] ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {reminders[key as keyof typeof reminders] && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={next}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {step === steps.length - 1 ? 'Start Tracking' : 'Continue'}
          <ChevronRight className="w-4 h-4" />
        </button>

        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back
          </button>
        )}
      </motion.div>
    </div>
  );
}
