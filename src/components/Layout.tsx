import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, Heart, Flame, Bell, Info, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Today' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/quran', icon: BookOpen, label: "Qur'an" },
  { to: '/dhikr', icon: Heart, label: 'Adhkar' },
  { to: '/streaks', icon: Flame, label: 'Streaks' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { signOut, isGuest } = useAuth();

  return (
    <div className="min-h-screen bg-background pattern-overlay">
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-2">
          <span className="text-sm font-bold gold-text gold-glow">IbadahTrack</span>
          <div className="flex items-center gap-1">
            <NavLink to="/reminders" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
            </NavLink>
            <NavLink to="/about" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Info className="w-4 h-4" />
            </NavLink>
            <button onClick={signOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title={isGuest ? 'Exit guest' : 'Sign out'}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="pb-20 pt-12 max-w-lg mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around py-1.5">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[48px] min-h-[44px] justify-center ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[9px] font-medium">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
