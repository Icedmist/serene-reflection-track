import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Clock, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ReminderSetting {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
  time: string;
}

export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<ReminderSetting[]>([
    { key: 'fajr', label: 'Fajr Prayer', icon: '🌅', enabled: true, time: '04:30' },
    { key: 'tahajjud', label: 'Tahajjud', icon: '🌙', enabled: true, time: '01:00' },
    { key: 'quran', label: 'Qur\'an Session', icon: '📖', enabled: true, time: '05:30' },
    { key: 'dhikr', label: 'Dhikr Time', icon: '📿', enabled: false, time: '13:00' },
    { key: 'dhuhr', label: 'Dhuhr Prayer', icon: '☀️', enabled: false, time: '12:30' },
    { key: 'asr', label: 'Asr Prayer', icon: '🌤️', enabled: false, time: '16:00' },
    { key: 'maghrib', label: 'Maghrib / Iftar', icon: '🌅', enabled: false, time: '18:45' },
    { key: 'taraweeh', label: 'Taraweeh', icon: '🕌', enabled: false, time: '19:30' },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const toggleReminder = (key: string) => {
    setReminders(prev => prev.map(r => r.key === key ? { ...r, enabled: !r.enabled } : r));
  };

  const updateTime = (key: string, time: string) => {
    setReminders(prev => prev.map(r => r.key === key ? { ...r, time } : r));
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Your browser does not support notifications');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast.success('Notifications enabled!');
      // Schedule a test notification
      new Notification('IbadahTrack 🌙', {
        body: 'Notifications are now enabled. You will receive worship reminders.',
        icon: '/favicon.ico',
      });
    } else {
      toast.error('Notification permission denied');
    }
  };

  const handleSave = async () => {
    if (user) {
      const fajr = reminders.find(r => r.key === 'fajr')!;
      const quran = reminders.find(r => r.key === 'quran')!;
      const dhikr = reminders.find(r => r.key === 'dhikr')!;
      const tahajjud = reminders.find(r => r.key === 'tahajjud')!;

      await supabase.from('profiles').update({
        reminder_fajr: fajr.enabled,
        reminder_quran: quran.enabled,
        reminder_dhikr: dhikr.enabled,
        reminder_tahajjud: tahajjud.enabled,
        reminder_time_fajr: fajr.time,
        reminder_time_quran: quran.time,
        reminder_time_dhikr: dhikr.time,
        reminder_time_tahajjud: tahajjud.time,
      }).eq('user_id', user.id);
    }

    // Schedule browser notifications for enabled reminders
    if (notificationsEnabled || Notification.permission === 'granted') {
      scheduleNotifications();
    }

    toast.success('Reminder settings saved!');
  };

  const scheduleNotifications = () => {
    const now = new Date();
    reminders.filter(r => r.enabled).forEach(r => {
      const [hours, minutes] = r.time.split(':').map(Number);
      const reminderTime = new Date(now);
      reminderTime.setHours(hours, minutes, 0, 0);

      if (reminderTime > now) {
        const delay = reminderTime.getTime() - now.getTime();
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification(`${r.icon} ${r.label}`, {
              body: `It's time for ${r.label}. May Allah accept your worship.`,
              icon: '/favicon.ico',
              tag: r.key,
            });
          }
        }, delay);
      }
    });
  };

  return (
    <div className="px-4 pt-6 space-y-5 pb-6">
      <h1 className="text-xl font-bold gold-text flex items-center gap-2">
        <Bell className="w-5 h-5" /> Reminders
      </h1>

      {/* Push Notification Permission */}
      {'Notification' in window && Notification.permission !== 'granted' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border-primary/20 space-y-2"
        >
          <p className="text-xs font-semibold">Enable Push Notifications</p>
          <p className="text-[10px] text-muted-foreground">Get reminded for prayers and worship activities even when you're not looking at the app.</p>
          <button
            onClick={requestNotificationPermission}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold"
          >
            🔔 Enable Notifications
          </button>
        </motion.div>
      )}

      {Notification.permission === 'granted' && (
        <div className="glass-card p-3 flex items-center gap-2 border-accent/30">
          <span className="text-sm">✅</span>
          <p className="text-xs text-accent font-medium">Notifications are enabled</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Configure your worship reminders. Save to schedule today's notifications.
      </p>

      <div className="space-y-3">
        {reminders.map((r) => (
          <motion.div
            key={r.key}
            className={`glass-card p-4 transition-all ${r.enabled ? 'border-primary/30' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{r.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{r.label}</p>
                  {r.enabled && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <input
                        type="time"
                        value={r.time}
                        onChange={e => updateTime(r.key, e.target.value)}
                        className="text-xs bg-transparent text-muted-foreground outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleReminder(r.key)}
                className={`w-12 h-6 rounded-full transition-colors relative ${r.enabled ? 'bg-primary' : 'bg-secondary'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${r.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Save className="w-4 h-4" /> Save & Schedule
      </button>
    </div>
  );
}
