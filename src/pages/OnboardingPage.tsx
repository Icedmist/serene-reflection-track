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

const FOCUS_OPTIONS: { value: FocusArea; label: string; desc: string }[] = [
  { value: 'quran', label: '📖 Qur\'an Recitation', desc: 'Focus on completing and understanding the Qur\'an' },
  { value: 'salah', label: '🕌 Daily Salah Consistency', desc: 'Never miss a prayer' },
  { value: 'adhkar', label: '📿 Morning/Evening Adhkar', desc: 'Build a daily remembrance habit' },
  { value: 'night_prayers', label: '🌙 Night Prayers', desc: 'Tahajjud, Taraweeh, and Witr' },
  { value: 'dua', label: '🤲 Du\'a', desc: 'Strengthen your du\'a practice' },
  { value: 'streaks', label: '🔥 Habit Streaks', desc: 'Track and maintain consistency' },
  { value: 'balanced', label: '⚖️ Balanced Worship', desc: 'A little of everything, done well' },
];

const QURAN_STYLES = [
  { value: 'surah', label: '📖 By Surah', desc: 'Track which Surah you\'re reading' },
  { value: 'juz', label: '📕 By Juz', desc: 'Track by Juz (para) number' },
  { value: 'page', label: '📄 By Page', desc: 'Track pages read' },
  { value: 'ayah', label: '🔖 By Ayah', desc: 'Track exact ayah position' },
] as const;

const ACTIVITY_OPTIONS: { value: EnabledActivity; label: string; icon: string }[] = [
  { value: 'morning_adhkar', label: 'Morning Adhkar', icon: '🌅' },
  { value: 'evening_adhkar', label: 'Evening Adhkar', icon: '🌇' },
  { value: 'tahajjud', label: 'Tahajjud', icon: '🌙' },
  { value: 'taraweeh', label: 'Taraweeh', icon: '🕌' },
  { value: 'tafseer', label: 'Tafseer', icon: '📚' },
  { value: 'salatul_tasbeeh', label: 'Salatul Tasbeeh', icon: '🙏' },
  { value: 'dua_journal', label: 'Du\'a Journal', icon: '🤲' },
  { value: 'reflections', label: 'Reflections', icon: '✍️' },
];

const PRIVACY_OPTIONS: { value: PrivacyMode; label: string; desc: string; icon: string }[] = [
  { value: 'private', label: 'Private Only', desc: 'Keep everything personal', icon: '🔒' },
  { value: 'share_streaks', label: 'Share Streaks', desc: 'Share selected streaks to inspire others', icon: '🔥' },
  { value: 'share_summaries', label: 'Share Summaries', desc: 'Share daily or weekly summaries', icon: '🌍' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const { setState } = useStore();
  const [step, setStep] = useState(0);
  const [modes, setModes] = useState<string[]>(['itikaf']);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(['balanced']);
  const [quranStyle, setQuranStyle] = useState<'surah' | 'juz' | 'page' | 'ayah'>('surah');
  const [activities, setActivities] = useState<EnabledActivity[]>(['morning_adhkar', 'evening_adhkar', 'tahajjud', 'taraweeh', 'reflections']);
  const [privacy, setPrivacy] = useState<PrivacyMode>('private');

  const currentStep = steps[step];

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
      quranProgress: { ...prev.quranProgress, trackingStyle: quranStyle },
    }));

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

  const canProceed = () => {
    if (currentStep === 'mode') return modes.length > 0;
    if (currentStep === 'focus') return focusAreas.length > 0;
    if (currentStep === 'activities') return activities.length > 0;
    return true;
  };

  const stepIcons = [Moon, Target, BookOpen, Sparkles, Shield];
  const StepIcon = stepIcons[step];

  return (
    <div className="min-h-screen bg-background pattern-overlay flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-sm space-y-5"
      >
        {/* Progress */}
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {currentStep === 'mode' && (
              <div className="space-y-3">
                <div className="text-center space-y-1.5">
                  <Moon className="w-9 h-9 mx-auto text-primary" />
                  <h2 className="text-lg font-bold">Welcome to IbadahTrack</h2>
                  <p className="text-xs text-muted-foreground">Select your current mode(s). You can choose multiple.</p>
                </div>
                {MODE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleMode(opt.value)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      modes.includes(opt.value) ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 'focus' && (
              <div className="space-y-3">
                <div className="text-center space-y-1.5">
                  <Target className="w-9 h-9 mx-auto text-accent" />
                  <h2 className="text-lg font-bold">Your Main Focus</h2>
                  <p className="text-xs text-muted-foreground">What matters most to you? Select all that apply.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {FOCUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => toggleFocus(opt.value)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        focusAreas.includes(opt.value) ? 'border-primary bg-primary/10' : 'border-border bg-card'
                      }`}
                    >
                      <p className="font-semibold text-xs">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'quran' && (
              <div className="space-y-3">
                <div className="text-center space-y-1.5">
                  <BookOpen className="w-9 h-9 mx-auto text-accent" />
                  <h2 className="text-lg font-bold">Qur'an Tracking</h2>
                  <p className="text-xs text-muted-foreground">How do you track your recitation?</p>
                </div>
                {QURAN_STYLES.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setQuranStyle(opt.value)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      quranStyle === opt.value ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 'activities' && (
              <div className="space-y-3">
                <div className="text-center space-y-1.5">
                  <Sparkles className="w-9 h-9 mx-auto text-primary" />
                  <h2 className="text-lg font-bold">Enable Activities</h2>
                  <p className="text-xs text-muted-foreground">Toggle which activities to include in your daily plan.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => toggleActivity(opt.value)}
                      className={`text-left p-3 rounded-xl border transition-all flex items-center gap-2 ${
                        activities.includes(opt.value) ? 'border-primary bg-primary/10' : 'border-border bg-card'
                      }`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="font-medium text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'privacy' && (
              <div className="space-y-3">
                <div className="text-center space-y-1.5">
                  <Shield className="w-9 h-9 mx-auto text-primary" />
                  <h2 className="text-lg font-bold">Privacy</h2>
                  <p className="text-xs text-muted-foreground">How would you like to share your journey?</p>
                </div>
                {PRIVACY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPrivacy(opt.value)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      privacy === opt.value ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.icon} {opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={next}
          disabled={!canProceed()}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {step === steps.length - 1 ? 'Start Tracking' : 'Continue'}
          <ChevronRight className="w-4 h-4" />
        </button>

        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
            <ChevronLeft className="w-3 h-3" /> Back
          </button>
        )}
      </motion.div>
    </div>
  );
}
