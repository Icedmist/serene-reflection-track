import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, type LocalUser } from './db';
import { AuthService } from './auth-service';

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    const guest = localStorage.getItem('ibadah-guest') === 'true';
    if (guest && !localStorage.getItem('ibadah-guest-id')) {
      localStorage.setItem('ibadah-guest-id', `guest-${Math.random().toString(36).substring(2, 11)}`);
    }
    return guest;
  });

  useEffect(() => {
    // Check for existing session on mount
    AuthService.getCurrentUser().then(currentUser => {
      setUser(currentUser);
      if (currentUser) setIsGuest(false);
      setLoading(false);
    });
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await AuthService.signUp(email, password, displayName);
    if (data?.user) {
      setUser(data.user);
      setIsGuest(false);
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await AuthService.signIn(email, password);
    if (data?.user) {
      setUser(data.user);
      setIsGuest(false);
    }
    return { error };
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('ibadah-guest');
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    setUser(null);
    localStorage.setItem('ibadah-guest', 'true');
    if (!localStorage.getItem('ibadah-guest-id')) {
      localStorage.setItem('ibadah-guest-id', `guest-${Math.random().toString(36).substring(2, 11)}`);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, isAdmin, signUp, signIn, signOut, enterGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
