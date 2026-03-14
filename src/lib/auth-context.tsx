import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  mode: string;
  quran_tracking_style: string;
  sharing_enabled: boolean;
  onboarded: boolean;
  current_ramadan_day: number;
  total_xp: number;
  reminder_fajr: boolean;
  reminder_quran: boolean;
  reminder_dhikr: boolean;
  reminder_tahajjud: boolean;
  reminder_time_fajr: string | null;
  reminder_time_quran: string | null;
  reminder_time_dhikr: string | null;
  reminder_time_tahajjud: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('ibadah-guest') === 'true');
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) setProfile(data as Profile);
    return data;
  };

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .rpc('has_role', { _user_id: userId, _role: 'admin' });
    setIsAdmin(!!data);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    // Set up listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsGuest(false);
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(async () => {
          await fetchProfile(session.user.id);
          await checkAdmin(session.user.id);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsGuest(false);
        fetchProfile(session.user.id);
        checkAdmin(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error };
    // Profile is auto-created by trigger
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setIsGuest(false);
    localStorage.removeItem('ibadah-guest');
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    setUser(null);
    setProfile(null);
    localStorage.setItem('ibadah-guest', 'true');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isGuest, isAdmin, signUp, signIn, signOut, enterGuestMode, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
