import { AppState, DailyTask, DhikrCounter, DayLog } from './types';

const ITIKAF_TEMPLATE: Omit<DailyTask, 'completed' | 'notes'>[] = [
  { id: 'tahajjud', title: 'Tahajjud + Du\'a', category: 'salah', timeSlot: '1:00 AM', streakEnabled: true },
  { id: 'istighfar', title: 'Istighfar & Quiet Dhikr', category: 'dhikr', timeSlot: '3:00 AM' },
  { id: 'suhoor', title: 'Suhoor', category: 'meal', timeSlot: '3:30 AM' },
  { id: 'fajr', title: 'Fajr', category: 'salah', timeSlot: '4:30 AM', streakEnabled: true },
  { id: 'morning-adhkar', title: 'Morning Adhkar', category: 'dhikr', timeSlot: '5:00 AM' },
  { id: 'quran-morning', title: 'Qur\'an Recitation', category: 'quran', timeSlot: '5:30 AM', streakEnabled: true },
  { id: 'tafakkur', title: 'Reflection / Tafakkur', category: 'custom', timeSlot: '7:00 AM' },
  { id: 'rest-morning', title: 'Rest', category: 'rest', timeSlot: '7:30 AM' },
  { id: 'quran-mid', title: 'Qur\'an Recitation', category: 'quran', timeSlot: '9:00 AM' },
  { id: 'dhuha', title: 'Dhuha Prayer', category: 'salah', timeSlot: '10:00 AM' },
  { id: 'dhuhr', title: 'Dhuhr', category: 'salah', timeSlot: '12:30 PM', streakEnabled: true },
  { id: 'dhikr-midday', title: 'Short Dhikr + Du\'a', category: 'dhikr', timeSlot: '1:00 PM' },
  { id: 'tafseer', title: 'Tafseer Session', category: 'quran', timeSlot: '2:40 PM', streakEnabled: true },
  { id: 'asr', title: 'Asr', category: 'salah', timeSlot: '4:00 PM', streakEnabled: true },
  { id: 'salat-tasbeeh', title: 'Salatul Tasbeeh', category: 'salah', timeSlot: '4:30 PM' },
  { id: 'quran-afternoon', title: 'Qur\'an Recitation', category: 'quran', timeSlot: '5:00 PM' },
  { id: 'dua-maghrib', title: 'Du\'a Before Maghrib', category: 'dua', timeSlot: '6:30 PM' },
  { id: 'maghrib', title: 'Maghrib / Iftar', category: 'salah', timeSlot: '6:45 PM', streakEnabled: true },
  { id: 'quran-review', title: 'Qur\'an Review', category: 'quran', timeSlot: '7:15 PM' },
  { id: 'taraweeh', title: 'Taraweeh', category: 'salah', timeSlot: '7:30 PM', streakEnabled: true },
  { id: 'after-taraweeh', title: 'After Taraweeh Dhikr', category: 'dhikr', timeSlot: '9:30 PM' },
  { id: 'sleep', title: 'Sleep / Rest', category: 'rest', timeSlot: '10:00 PM' },
];

const DEFAULT_DHIKR: DhikrCounter[] = [
  { id: 'istighfar', name: 'Istighfar', nameAr: 'أستغفر الله', count: 0, target: 100 },
  { id: 'salawat', name: 'Salawat', nameAr: 'اللهم صل على محمد', count: 0, target: 100 },
  { id: 'subhanallah', name: 'Tasbeeh', nameAr: 'سبحان الله', count: 0, target: 33 },
  { id: 'alhamdulillah', name: 'Tahmid', nameAr: 'الحمد لله', count: 0, target: 33 },
  { id: 'allahuakbar', name: 'Takbir', nameAr: 'الله أكبر', count: 0, target: 33 },
  { id: 'lailaha', name: 'Tahlil', nameAr: 'لا إله إلا الله', count: 0, target: 100 },
];

function createDayLog(ramadanDay: number, date: string, completionRate: number): DayLog {
  const tasks = ITIKAF_TEMPLATE.map(t => ({
    ...t,
    completed: Math.random() < completionRate,
    notes: '',
  }));
  const completedCount = tasks.filter(t => t.completed).length;
  const dhikr = DEFAULT_DHIKR.map(d => ({
    ...d,
    count: Math.floor(d.target * completionRate * (0.7 + Math.random() * 0.3)),
  }));
  return {
    date,
    ramadanDay,
    tasks,
    dhikr,
    completionPercent: Math.round((completedCount / tasks.length) * 100),
  };
}

export function generateDemoState(): AppState {
  const days: Record<string, DayLog> = {};
  const baseDate = new Date(2025, 2, 1); // March 1, 2025

  for (let i = 1; i <= 22; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i - 1);
    const dateStr = date.toISOString().split('T')[0];
    const rate = i <= 5 ? 0.6 + Math.random() * 0.3 : i <= 15 ? 0.75 + Math.random() * 0.2 : 0.85 + Math.random() * 0.15;
    days[dateStr] = createDayLog(i, dateStr, rate);
  }

  // Make day 22 (today) partially complete
  const todayDate = new Date(baseDate);
  todayDate.setDate(todayDate.getDate() + 21);
  const todayStr = todayDate.toISOString().split('T')[0];
  const todayTasks = ITIKAF_TEMPLATE.map((t, i) => ({
    ...t,
    completed: i < 12,
    notes: '',
  }));
  days[todayStr] = {
    date: todayStr,
    ramadanDay: 22,
    tasks: todayTasks,
    dhikr: DEFAULT_DHIKR.map(d => ({
      ...d,
      count: Math.floor(d.target * 0.6),
    })),
    reflectionNote: 'Alhamdulillah, feeling more focused in salah today. The night prayers felt deeply connected.',
    completionPercent: Math.round((12 / ITIKAF_TEMPLATE.length) * 100),
  };

  return {
    userName: 'Abdullah',
    currentRamadanDay: 22,
    mode: 'itikaf',
    quranProgress: {
      trackingStyle: 'surah',
      startSurah: 1,
      currentSurah: 7,
      startJuz: 1,
      currentJuz: 8,
      dailyLogs: [],
    },
    days,
    streaks: [
      { habit: 'Tahajjud', currentStreak: 18, longestStreak: 18, icon: '🌙' },
      { habit: 'Taraweeh', currentStreak: 22, longestStreak: 22, icon: '🕌' },
      { habit: 'Qur\'an', currentStreak: 15, longestStreak: 15, icon: '📖' },
      { habit: 'Tafseer', currentStreak: 10, longestStreak: 12, icon: '📚' },
      { habit: 'Fajr on Time', currentStreak: 22, longestStreak: 22, icon: '🌅' },
    ],
    sharingEnabled: true,
    onboarded: true,
  };
}

export { ITIKAF_TEMPLATE, DEFAULT_DHIKR };
