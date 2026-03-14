import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { Moon, BookOpen, Bell, Share2, ChevronRight, ChevronLeft, Target, Sparkles, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FocusArea, EnabledActivity, PrivacyMode } from '@/lib/types';

const steps = ['mode', 'focus', 'quran', 'activities', 'privacy'] as const;

const MODE_OPTIONS = [
  { value: 'ramadan', label: '🌙 Ramadan', desc: 'Track daily worship during Ramadan' },
  { value: 'itikaf', label: '🕌 I\'tikaf', desc: 'Full schedule for mosque retreat' },
  { value: 'general', label: '📿 General Worship', desc: 'Year-round worship tracking' },
] as const;

const FOCUS_OPTIONS: { value: FocusArea; label: string; icon: string }[] = [
  { value: 'quran', label: 'Qur\'an recitation', icon: '📖' },
  { value: 'salah', label: 'Daily salah consistency', icon: '🕌' },
  { value: 'adhkar', label: 'Morning/evening adhkar', icon: '📿' },
  { value: 'night_prayers', label: 'Night prayers', icon: '🌙' },
  { value: 'dua', label: 'Du\'a', icon: '🤲' },
  { value: 'streaks', label: 'Habit streaks', icon: '🔥' },
  { value: 'balanced', label: 'Balanced routine', icon: '⚖️' },
];

const QURAN_STYLES = [
  { value: 'surah', label: 'Surah-based', icon: '📄' },
  { value: 'juz', label: 'Juz-based', icon: '📚' },
  { value: 'page', label: 'Page-based', icon: '📃' },
  { value: 'ayah', label: 'Ayah-based', icon: '✨' },
] as const;

const ACTIVITY_OPTIONS: { value: EnabledActivity; label: string; icon: string }[] = [
  { value: 'morning_adhkar', label: 'Morning Adhkar', icon: '🌅' },
  { value: 'evening_adhkar', label: 'Evening Adhkar', icon: '🌇' },
  { value: 'tahajjud', label: 'Tahajjud', icon: '🌙' },
  { value: 'taraweeh', label: 'Taraweeh', icon: '🕌' },
  { value: 'tafseer', label: 'Tafseer', icon: '📖' },
  { value: 'salatul_tasbeeh', label: 'Salatul Tasbeeh', icon: '🙏' },
  { value: 'dua_journal', label: 'Du\'a Journal', icon: '🤲' },
  { value: 'reflections', label: 'Reflections', icon: '✍️' },
];

const PRIVACY_OPTIONS: { value: PrivacyMode; label: string; desc: string; icon: string }[] = [
  { value: 'private', label: 'Private Only', desc: 'Your data stays on your device', icon: '🔒' },
  { value: 'share_streaks', label: 'Share Streaks', desc: 'Show your streaks on leaderboard', icon: '📊' },
  { value: 'share_summaries', label: 'Share Summaries', desc: 'Share daily summaries publicly', icon: '📤' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const { setState } = useStore();
  const [step, setStep] = useState(0);
  const [modes, setModes] = useState<string[]>(['ramadan']);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(['balanced']);
  const [quranStyle, setQuranStyle] = useState<string>('surah');
  const [activities, setActivities] = useState<EnabledActivity[]>(['morning_adhkar', 'evening_adhkar', 'tahajjud', 'taraweeh', 'reflections']);
  const [privacy, setPrivacy] = useState<PrivacyMode>('private');

  const toggleMode = (v: string) => {
    setModes(prev => prev.includes(v) ? prev.filter(m => m !== v) : [...prev, v]);
  };

  const toggleFocus = (v: FocusArea) => {
    setFocusAreas(prev => prev.includes(v) ? prev.filter(f => f !== v) : [...prev, v]);
  };

  const toggleActivity = (v: EnabledActivity) => {
    setActivities(prev => prev.includes(v) ? prev.filter(a => a !== v) : [...prev, v]);
  };

  const handleComplete = async () => {
    setState(prev => ({
      ...prev,
      mode: modes as any,
      focusAreas,
      enabledActivities: activities,
      privacyMode: privacy,
      onboarded: true,
      sharingEnabled: privacy !== 'private',
      quranProgress: { ...prev.quranProgress, trackingStyle: quranStyle as any },
    }));

    // Sync to Supabase profile
    if (user) {
      await supabase.from('profiles').update({
        mode: modes.join(','),
        quran_tracking_style: quranStyle,
        sharing_enabled: privacy !== 'private',
        onboarded: true,
      }).eq('user_id', user.id);
    }
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleComplete();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-background pattern-overlay flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Progress */}
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {currentStep === 'mode' && (
              <>
                <div className="text-center space-y-2">
                  <Moon className="w-10 h-10 mx-auto text-primary" />
                  <h2 className="text-xl font-bold gold-text gold-glow">بسم الله</h2>
                  <p className="text-sm text-muted-foreground">What mode are you in?</p>
                  <p className="text-[10px] text-muted-foreground">You can select multiple</p>
                </div>
                <div className="space-y-2">
                  {MODE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => toggleMode(opt.value)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${modes.includes(opt.value) ? 'bg-primary/10 border-2 border-primary/30' : 'glass-card'}`}
                    >
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {currentStep === 'focus' && (
              <>
                <div className="text-center space-y-2">
                  <Target className="w-10 h-10 mx-auto text-accent" />
                  <h2 className="text-lg font-bold">Your Focus Areas</h2>
                  <p className="text-sm text-muted-foreground">Select what matters most</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {FOCUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => toggleFocus(opt.value)}
                      className={`p-3 rounded-xl text-left transition-all ${focusAreas.includes(opt.value) ? 'bg-primary/10 border-2 border-primary/30' : 'glass-card'}`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <p className="text-[10px] font-medium mt-1">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {currentStep === 'quran' && (
              <>
                <div className="text-center space-y-2">
                  <BookOpen className="w-10 h-10 mx-auto text-accent" />
                  <h2 className="text-lg font-bold">Qur'an Tracking</h2>
                  <p className="text-sm text-muted-foreground">How do you track your reading?</p>
                </div>
                <div className="space-y-2">
                  {QURAN_STYLES.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setQuranStyle(opt.value)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${quranStyle === opt.value ? 'bg-primary/10 border-2 border-primary/30' : 'glass-card'}`}
                    >
                      <span className="text-lg mr-2">{opt.icon}</span>
                      <span className="font-semibold text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {currentStep === 'activities' && (
              <>
                <div className="text-center space-y-2">
                  <Sparkles className="w-10 h-10 mx-auto text-primary" />
                  <h2 className="text-lg font-bold">Activities</h2>
                  <p className="text-sm text-muted-foreground">Enable or disable activities</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => toggleActivity(opt.value)}
                      className={`p-3 rounded-xl text-left transition-all ${activities.includes(opt.value) ? 'bg-primary/10 border-2 border-primary/30' : 'glass-card'}`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <p className="text-[10px] font-medium mt-1">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {currentStep === 'privacy' && (
              <>
                <div className="text-center space-y-2">
                  <Shield className="w-10 h-10 mx-auto text-accent" />
                  <h2 className="text-lg font-bold">Privacy</h2>
                  <p className="text-sm text-muted-foreground">Control what you share</p>
                </div>
                <div className="space-y-2">
                  {PRIVACY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPrivacy(opt.value)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${privacy === opt.value ? 'bg-primary/10 border-2 border-primary/30' : 'glass-card'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{opt.icon}</span>
                        <div>
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={prev}
              className="flex items-center gap-1 px-4 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            onClick={next}
            disabled={currentStep === 'mode' && modes.length === 0}
            className="flex-1 flex items-center justify-center gap-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {step === steps.length - 1 ? 'Start Journey ✨' : 'Continue'}
            {step < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
