import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, DayLog, DhikrCounter, DuaEntry, QuranSession, AdhkarMicrotask, MORNING_ADHKAR_TEMPLATE, EVENING_ADHKAR_TEMPLATE, DailyTask } from './types';
import { generateInitialState, ITIKAF_TEMPLATE, DEFAULT_DHIKR } from './demo-data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';

const STORAGE_KEY = 'ibadahtrack-v2';

interface StoreContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  todayLog: DayLog;
  todayKey: string;
  toggleTask: (taskId: string) => void;
  updateDhikr: (dhikrId: string, delta: number) => void;
  updateReflection: (note: string) => void;
  updateQuranSurah: (surah: number) => void;
  getDayLog: (date: string) => DayLog | undefined;
  resetDemo: () => void;
  updateAdhkar: (type: 'morning' | 'evening', id: string, delta: number) => void;
  markAdhkarSetComplete: (type: 'morning' | 'evening') => void;
  startQuranSession: (surah: number, ayah: number) => void;
  pauseQuranSession: () => void;
  resumeQuranSession: () => void;
  completeQuranSession: (ayahsRead: number) => void;
  saveQuranStopPoint: (surah: number, ayah: number) => void;
  addDua: (text: string) => void;
  toggleDuaAnswered: (id: string) => void;
  removeDua: (id: string) => void;
  addXp: (amount: number) => void;
  updateHijriOffset: (offset: number) => void;
  addCustomTask: (task: Omit<DailyTask, 'completed' | 'notes'>) => void;
  removeTask: (taskId: string) => void;
  editTask: (taskId: string, updates: Partial<DailyTask>) => void;
  syncToCloud: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

/** Always return today's actual date key */
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();

  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.mode === 'string') parsed.mode = [parsed.mode];
        if (!parsed.focusAreas) parsed.focusAreas = ['balanced'];
        if (!parsed.enabledActivities) parsed.enabledActivities = ['morning_adhkar', 'evening_adhkar', 'tahajjud', 'taraweeh', 'reflections'];
        if (!parsed.privacyMode) parsed.privacyMode = 'private';
        if (!parsed.duas) parsed.duas = [];
        if (parsed.totalXp === undefined) parsed.totalXp = 0;
        if (parsed.hijriOffset === undefined) parsed.hijriOffset = 0;
        if (parsed.calculationMethod === undefined) parsed.calculationMethod = 'standard';
        if (!parsed.quranProgress.currentAyah) parsed.quranProgress.currentAyah = 1;
        if (!parsed.quranProgress.currentPage) parsed.quranProgress.currentPage = 1;
        return parsed;
      }
    } catch { }
    return generateInitialState();
  });

  // Update userName from profile
  useEffect(() => {
    if (profile?.display_name && profile.display_name !== state.userName) {
      setState(prev => ({ ...prev, userName: profile.display_name }));
    }
  }, [profile]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Use actual today's date
  const todayKey = getTodayKey();

  // Ensure today's log exists
  const todayLog = state.days[todayKey] || {
    date: todayKey,
    ramadanDay: state.currentRamadanDay,
    tasks: ITIKAF_TEMPLATE.map(t => ({ ...t, completed: false, notes: '' })),
    dhikr: DEFAULT_DHIKR,
    completionPercent: 0,
    morningAdhkar: MORNING_ADHKAR_TEMPLATE.map(a => ({ ...a, completed: false })),
    eveningAdhkar: EVENING_ADHKAR_TEMPLATE.map(a => ({ ...a, completed: false })),
  };

  // Auto-create today's entry if missing
  useEffect(() => {
    if (!state.days[todayKey]) {
      setState(prev => ({
        ...prev,
        days: {
          ...prev.days,
          [todayKey]: {
            date: todayKey,
            ramadanDay: prev.currentRamadanDay,
            tasks: ITIKAF_TEMPLATE.map(t => ({ ...t, completed: false, notes: '' })),
            dhikr: DEFAULT_DHIKR.map(d => ({ ...d, count: 0 })),
            completionPercent: 0,
            morningAdhkar: MORNING_ADHKAR_TEMPLATE.map(a => ({ ...a, completed: false, count: 0 })),
            eveningAdhkar: EVENING_ADHKAR_TEMPLATE.map(a => ({ ...a, completed: false, count: 0 })),
          },
        },
      }));
    }
  }, [todayKey]);

  // Sync XP to cloud profile
  const syncToCloud = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.from('profiles').update({
        total_xp: state.totalXp,
        display_name: state.userName,
        current_ramadan_day: state.currentRamadanDay,
        mode: state.mode.join(','),
        quran_tracking_style: state.quranProgress.trackingStyle,
        sharing_enabled: state.sharingEnabled,
      }).eq('user_id', user.id);
    } catch (e) {
      console.error('Sync failed:', e);
    }
  }, [user, state.totalXp, state.userName, state.currentRamadanDay, state.mode, state.quranProgress.trackingStyle, state.sharingEnabled]);

  // Auto-sync every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(syncToCloud, 30000);
    return () => clearInterval(interval);
  }, [user, syncToCloud]);

  // Also sync on state changes (debounced)
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(syncToCloud, 5000);
    return () => clearTimeout(timeout);
  }, [state.totalXp, state.sharingEnabled, state.userName]);

  const toggleTask = useCallback((taskId: string) => {
    setState(prev => {
      const day = { ...prev.days[todayKey] || todayLog };
      const tasks = day.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const completedCount = tasks.filter(t => t.completed).length;
      const updated: DayLog = { ...day, tasks, completionPercent: Math.round((completedCount / tasks.length) * 100) };
      return { ...prev, days: { ...prev.days, [todayKey]: updated } };
    });
  }, [todayKey]);

  const updateDhikr = useCallback((dhikrId: string, delta: number) => {
    setState(prev => {
      const day = { ...prev.days[todayKey] || todayLog };
      const dhikr = day.dhikr.map(d => d.id === dhikrId ? { ...d, count: Math.max(0, d.count + delta) } : d);
      return { ...prev, days: { ...prev.days, [todayKey]: { ...day, dhikr } } };
    });
  }, [todayKey]);

  const updateReflection = useCallback((note: string) => {
    setState(prev => {
      const day = { ...prev.days[todayKey] || todayLog };
      return { ...prev, days: { ...prev.days, [todayKey]: { ...day, reflectionNote: note } } };
    });
  }, [todayKey]);

  const updateQuranSurah = useCallback((surah: number) => {
    setState(prev => ({
      ...prev,
      quranProgress: { ...prev.quranProgress, currentSurah: Math.min(114, Math.max(1, surah)) },
    }));
  }, []);

  const getDayLog = useCallback((date: string) => state.days[date], [state.days]);

  const resetDemo = useCallback(() => {
    const fresh = generateInitialState();
    setState(fresh);
  }, []);

  const updateAdhkar = useCallback((type: 'morning' | 'evening', id: string, delta: number) => {
    setState(prev => {
      const day = { ...prev.days[todayKey] || todayLog };
      const key = type === 'morning' ? 'morningAdhkar' : 'eveningAdhkar';
      const adhkar = (day[key] || []).map(a => {
        if (a.id !== id) return a;
        const newCount = Math.max(0, Math.min(a.target, a.count + delta));
        return { ...a, count: newCount, completed: newCount >= a.target };
      });
      return { ...prev, days: { ...prev.days, [todayKey]: { ...day, [key]: adhkar } } };
    });
  }, [todayKey]);

  const markAdhkarSetComplete = useCallback((type: 'morning' | 'evening') => {
    setState(prev => {
      const day = { ...prev.days[todayKey] || todayLog };
      const key = type === 'morning' ? 'morningAdhkar' : 'eveningAdhkar';
      const adhkar = (day[key] || []).map(a => ({ ...a, count: a.target, completed: true }));
      return { ...prev, days: { ...prev.days, [todayKey]: { ...day, [key]: adhkar } } };
    });
  }, [todayKey]);

  const startQuranSession = useCallback((surah: number, ayah: number) => {
    setState(prev => ({
      ...prev,
      quranProgress: {
        ...prev.quranProgress,
        lastSession: { id: Date.now().toString(), surah, ayah, startedAt: new Date().toISOString(), status: 'active', ayahsRead: 0, duration: 0 },
      },
    }));
  }, []);

  const pauseQuranSession = useCallback(() => {
    setState(prev => {
      if (!prev.quranProgress.lastSession) return prev;
      return { ...prev, quranProgress: { ...prev.quranProgress, lastSession: { ...prev.quranProgress.lastSession, status: 'paused' } } };
    });
  }, []);

  const resumeQuranSession = useCallback(() => {
    setState(prev => {
      if (!prev.quranProgress.lastSession) return prev;
      return { ...prev, quranProgress: { ...prev.quranProgress, lastSession: { ...prev.quranProgress.lastSession, status: 'active' } } };
    });
  }, []);

  const completeQuranSession = useCallback((ayahsRead: number) => {
    setState(prev => {
      if (!prev.quranProgress.lastSession) return prev;
      return { ...prev, quranProgress: { ...prev.quranProgress, lastSession: { ...prev.quranProgress.lastSession, status: 'completed', ayahsRead, endedAt: new Date().toISOString() } } };
    });
  }, []);

  const saveQuranStopPoint = useCallback((surah: number, ayah: number) => {
    setState(prev => ({
      ...prev,
      quranProgress: { ...prev.quranProgress, currentSurah: surah, currentAyah: ayah },
    }));
  }, []);

  const addDua = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      duas: [...prev.duas, { id: Date.now().toString(), text, answered: false, createdAt: new Date().toISOString() }],
    }));
  }, []);

  const toggleDuaAnswered = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      duas: prev.duas.map(d => d.id === id ? { ...d, answered: !d.answered } : d),
    }));
  }, []);

  const removeDua = useCallback((id: string) => {
    setState(prev => ({ ...prev, duas: prev.duas.filter(d => d.id !== id) }));
  }, []);

  const addXp = useCallback((amount: number) => {
    setState(prev => ({ ...prev, totalXp: prev.totalXp + amount }));
  }, []);

  const updateHijriOffset = useCallback((offset: number) => {
    setState(prev => ({ ...prev, hijriOffset: offset }));
  }, []);

  const addCustomTask = useCallback((task: Omit<DailyTask, 'completed' | 'notes'>) => {
    setState(prev => {
      const day = { ...prev.days[todayKey] || todayLog };
      const newTask: DailyTask = { ...task, completed: false, notes: '' };
      const tasks = [...day.tasks, newTask];
      return { ...prev, days: { ...prev.days, [todayKey]: { ...day, tasks } } };
    });
  }, [todayKey]);

  const removeTask = useCallback((taskId: string) => {
    setState(prev => {
      const day = { ...prev.days[todayKey] || todayLog };
      const tasks = day.tasks.filter(t => t.id !== taskId);
      const completedCount = tasks.filter(t => t.completed).length;
      return { ...prev, days: { ...prev.days, [todayKey]: { ...day, tasks, completionPercent: tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0 } } };
    });
  }, [todayKey]);

  const editTask = useCallback((taskId: string, updates: Partial<DailyTask>) => {
    setState(prev => {
      const day = { ...prev.days[todayKey] || todayLog };
      const tasks = day.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      return { ...prev, days: { ...prev.days, [todayKey]: { ...day, tasks } } };
    });
  }, [todayKey]);

  return (
    <StoreContext.Provider value={{
      state, setState, todayLog, todayKey, toggleTask, updateDhikr, updateReflection, updateQuranSurah,
      getDayLog, resetDemo, updateAdhkar, markAdhkarSetComplete,
      startQuranSession, pauseQuranSession, resumeQuranSession, completeQuranSession, saveQuranStopPoint,
      addDua, toggleDuaAnswered, removeDua, addXp, updateHijriOffset,
      addCustomTask, removeTask, editTask, syncToCloud,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
