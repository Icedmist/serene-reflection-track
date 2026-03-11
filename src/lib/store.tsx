import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, DayLog, DhikrCounter } from './types';
import { generateDemoState, ITIKAF_TEMPLATE, DEFAULT_DHIKR } from './demo-data';

const STORAGE_KEY = 'ibadahtrack-state';

interface StoreContextType {
  state: AppState;
  todayLog: DayLog;
  toggleTask: (taskId: string) => void;
  updateDhikr: (dhikrId: string, delta: number) => void;
  updateReflection: (note: string) => void;
  updateQuranSurah: (surah: number) => void;
  getDayLog: (date: string) => DayLog | undefined;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

function getTodayKey(state: AppState): string {
  const entries = Object.entries(state.days);
  if (entries.length === 0) return new Date().toISOString().split('T')[0];
  const sorted = entries.sort((a, b) => b[0].localeCompare(a[0]));
  return sorted[0][0];
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return generateDemoState();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const todayKey = getTodayKey(state);
  const todayLog = state.days[todayKey] || {
    date: todayKey,
    ramadanDay: state.currentRamadanDay,
    tasks: ITIKAF_TEMPLATE.map(t => ({ ...t, completed: false, notes: '' })),
    dhikr: DEFAULT_DHIKR,
    completionPercent: 0,
  };

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
    const fresh = generateDemoState();
    setState(fresh);
  }, []);

  return (
    <StoreContext.Provider value={{ state, todayLog, toggleTask, updateDhikr, updateReflection, updateQuranSurah, getDayLog, resetDemo }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
