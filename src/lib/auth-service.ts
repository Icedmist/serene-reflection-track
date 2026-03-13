import { db, type LocalUser } from './db';

// Simple session token in localStorage
const SESSION_KEY = 'ibadah-session-user-id';

export const AuthService = {
    async signUp(email: string, password: string, name: string) {
        const existing = await db.users.where('email').equals(email).first();
        if (existing) {
            return { error: { message: 'User already exists' } };
        }

        const userId = await db.users.add({
            email,
            password, // In a real app, this should be hashed
            name,
            role: 'user',
            mode: 'ramadan',
            quran_tracking_style: 'surah',
            sharing_enabled: false,
            reminder_fajr: true,
            reminder_quran: true,
            reminder_dhikr: false,
            reminder_tahajjud: true,
            reminder_time_fajr: '04:30',
            reminder_time_quran: '05:30',
            reminder_time_dhikr: '13:00',
            reminder_time_tahajjud: '01:00',
            onboarded: false,
            current_ramadan_day: 1,
            total_xp: 0,
            created_at: new Date(),
            updated_at: new Date()
        });

        const user = await db.users.get(userId);
        if (!user) return { error: { message: 'Failed to create user' } };

        localStorage.setItem(SESSION_KEY, userId.toString());
        return { data: { user }, error: null };
    },

    async signIn(email: string, password: string) {
        const user = await db.users.where('email').equals(email).first();
        if (!user || user.password !== password) {
            return { error: { message: 'Invalid email or password' } };
        }

        localStorage.setItem(SESSION_KEY, user.id!.toString());
        return { data: { user }, error: null };
    },

    async signOut() {
        localStorage.removeItem(SESSION_KEY);
    },

    async getCurrentUser(): Promise<LocalUser | null> {
        const userIdStr = localStorage.getItem(SESSION_KEY);
        if (!userIdStr) return null;

        const userId = parseInt(userIdStr, 10);
        const user = await db.users.get(userId);
        return user || null;
    },

    async updateProfile(userId: number, updates: Partial<LocalUser>) {
        await db.users.update(userId, {
            ...updates,
            updated_at: new Date()
        });
        return await db.users.get(userId);
    }
};
