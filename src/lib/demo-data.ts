import { AppState, DailyTask, DhikrCounter, DayLog, MORNING_ADHKAR_TEMPLATE, EVENING_ADHKAR_TEMPLATE } from './types';

const ITIKAF_TEMPLATE: Omit<DailyTask, 'completed' | 'notes'>[] = [
  { id: 'tahajjud', title: 'Tahajjud + Du\'a', category: 'salah', timeSlot: '1:00 AM', timeBlock: 'dawn', streakEnabled: true, guidance: 'Pray 2-8 raka\'at with long sujood and sincere du\'a.' },
  { id: 'istighfar', title: 'Istighfar & Quiet Dhikr', category: 'dhikr', timeSlot: '3:00 AM', timeBlock: 'dawn', guidance: 'Seek forgiveness in the blessed last third of the night.' },
  { id: 'suhoor', title: 'Suhoor', category: 'meal', timeSlot: '3:30 AM', timeBlock: 'dawn' },
  { id: 'fajr', title: 'Fajr Prayer', category: 'salah', timeSlot: '4:30 AM', timeBlock: 'morning', streakEnabled: true },
  { id: 'morning-adhkar', title: 'Morning Adhkar', category: 'dhikr', timeSlot: '5:00 AM', timeBlock: 'morning', guidance: 'Complete morning remembrance set.' },
  { id: 'quran-morning', title: 'Qur\'an Recitation', category: 'quran', timeSlot: '5:30 AM', timeBlock: 'morning', streakEnabled: true },
  { id: 'tafakkur', title: 'Reflection / Tafakkur', category: 'custom', timeSlot: '7:00 AM', timeBlock: 'morning', guidance: 'Reflect on what you\'ve read and your journey.' },
  { id: 'rest-morning', title: 'Rest', category: 'rest', timeSlot: '7:30 AM', timeBlock: 'morning' },
  { id: 'quran-mid', title: 'Qur\'an Recitation', category: 'quran', timeSlot: '9:00 AM', timeBlock: 'morning' },
  { id: 'dhuha', title: 'Dhuha Prayer', category: 'salah', timeSlot: '10:00 AM', timeBlock: 'morning' },
  { id: 'dhuhr', title: 'Dhuhr Prayer', category: 'salah', timeSlot: '12:30 PM', timeBlock: 'afternoon', streakEnabled: true },
  { id: 'dhikr-midday', title: 'Short Dhikr + Du\'a', category: 'dhikr', timeSlot: '1:00 PM', timeBlock: 'afternoon' },
  { id: 'tafseer', title: 'Tafseer Session', category: 'quran', timeSlot: '2:40 PM', timeBlock: 'afternoon', streakEnabled: true, guidance: 'Study the meaning and context of what you\'ve recited.' },
  { id: 'asr', title: 'Asr Prayer', category: 'salah', timeSlot: '4:00 PM', timeBlock: 'evening', streakEnabled: true },
  { id: 'salat-tasbeeh', title: 'Salatul Tasbeeh', category: 'salah', timeSlot: '4:30 PM', timeBlock: 'evening', guidance: 'Special prayer with 300 tasbih. See guide for steps.' },
  { id: 'quran-afternoon', title: 'Qur\'an Recitation', category: 'quran', timeSlot: '5:00 PM', timeBlock: 'evening' },
  { id: 'evening-adhkar', title: 'Evening Adhkar', category: 'dhikr', timeSlot: '6:00 PM', timeBlock: 'evening', guidance: 'Complete evening remembrance set.' },
  { id: 'dua-maghrib', title: 'Du\'a Before Maghrib', category: 'dua', timeSlot: '6:30 PM', timeBlock: 'evening' },
  { id: 'maghrib', title: 'Maghrib / Iftar', category: 'salah', timeSlot: '6:45 PM', timeBlock: 'evening', streakEnabled: true },
  { id: 'quran-review', title: 'Qur\'an Review', category: 'quran', timeSlot: '7:15 PM', timeBlock: 'night' },
  { id: 'taraweeh', title: 'Taraweeh', category: 'salah', timeSlot: '7:30 PM', timeBlock: 'night', streakEnabled: true },
  { id: 'after-taraweeh', title: 'After Taraweeh Dhikr', category: 'dhikr', timeSlot: '9:30 PM', timeBlock: 'night' },
  { id: 'sleep', title: 'Sleep / Rest', category: 'rest', timeSlot: '10:00 PM', timeBlock: 'night' },
];

const DEFAULT_DHIKR: DhikrCounter[] = [
  { id: 'istighfar', name: 'Istighfar', nameAr: 'أستغفر الله', count: 0, target: 100 },
  { id: 'salawat', name: 'Salawat', nameAr: 'اللهم صل على محمد', count: 0, target: 100 },
  { id: 'subhanallah', name: 'Tasbeeh', nameAr: 'سبحان الله', count: 0, target: 33 },
  { id: 'alhamdulillah', name: 'Tahmid', nameAr: 'الحمد لله', count: 0, target: 33 },
  { id: 'allahuakbar', name: 'Takbir', nameAr: 'الله أكبر', count: 0, target: 33 },
  { id: 'lailaha', name: 'Tahlil', nameAr: 'لا إله إلا الله', count: 0, target: 100 },
];

export function generateInitialState(): AppState {
  const todayStr = new Date().toISOString().split('T')[0];
  const days: Record<string, DayLog> = {};

  days[todayStr] = {
    date: todayStr,
    tasks: ITIKAF_TEMPLATE.map(t => ({ ...t, completed: false, notes: '' })),
    dhikr: DEFAULT_DHIKR,
    completionPercent: 0,
    morningAdhkar: MORNING_ADHKAR_TEMPLATE.map(a => ({ ...a, completed: false, count: 0 })),
    eveningAdhkar: EVENING_ADHKAR_TEMPLATE.map(a => ({ ...a, completed: false, count: 0 })),
  };

  return {
    userName: 'User',
    mode: ['ramadan'],
    focusAreas: ['balanced'],
    enabledActivities: ['morning_adhkar', 'evening_adhkar', 'tahajjud', 'taraweeh', 'reflections'],
    privacyMode: 'private',
    quranProgress: {
      trackingStyle: 'surah',
      startSurah: 1,
      currentSurah: 1,
      currentAyah: 1,
      startJuz: 1,
      currentJuz: 1,
      currentPage: 1,
      dailyLogs: [],
    },
    days,
    streaks: [
      { habit: 'Tahajjud', currentStreak: 0, longestStreak: 0, icon: '🌙' },
      { habit: 'Taraweeh', currentStreak: 0, longestStreak: 0, icon: '🕌' },
      { habit: 'Qur\'an', currentStreak: 0, longestStreak: 0, icon: '📖' },
      { habit: 'Fajr on Time', currentStreak: 0, longestStreak: 0, icon: '🌅' },
    ],
    duas: [],
    sharingEnabled: false,
    onboarded: false,
    totalXp: 0,
    hijriOffset: 0,
    calculationMethod: 'standard',
  };
}

export { ITIKAF_TEMPLATE, DEFAULT_DHIKR };
