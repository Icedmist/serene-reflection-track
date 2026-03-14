// Legacy auth service - kept for backward compatibility but no longer used.
// Auth is now handled via Supabase in auth-context.tsx
import { db, type LocalUser } from './db';

const SESSION_KEY = 'ibadah-session-user-id';

export const AuthService = {
    async signUp(email: string, password: string, name: string) {
        return { data: null, error: { message: 'Use Supabase auth instead' } };
    },
    async signIn(email: string, password: string) {
        return { data: null, error: { message: 'Use Supabase auth instead' } };
    },
    async signOut() {
        localStorage.removeItem(SESSION_KEY);
    },
    async getCurrentUser(): Promise<LocalUser | null> {
        return null;
    },
    async updateProfile(userId: number, updates: Partial<LocalUser>) {
        return null;
    }
};
