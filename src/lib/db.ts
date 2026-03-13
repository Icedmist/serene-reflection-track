import Dexie, { type Table } from 'dexie';

export interface LocalUser {
    id?: number;
    email: string;
    password?: string; // Stored as plain text for simplicity in this demo, or hashed
    name: string;
    role: 'user' | 'admin';
    mode: 'ramadan' | 'itikaf' | 'general';
    quran_tracking_style: 'surah' | 'juz';
    sharing_enabled: boolean;
    reminder_fajr: boolean;
    reminder_quran: boolean;
    reminder_dhikr: boolean;
    reminder_tahajjud: boolean;
    reminder_time_fajr: string;
    reminder_time_quran: string;
    reminder_time_dhikr: string;
    reminder_time_tahajjud: string;
    onboarded: boolean;
    current_ramadan_day: number;
    total_xp: number;
    created_at: Date;
    updated_at: Date;
}

export interface DhikrLog {
    id?: number;
    userId: number | 'guest';
    adhkarId: string;
    count: number;
    date: Date;
}

export interface QuranProgress {
    id?: number;
    userId: number | 'guest';
    type: 'surah' | 'juz';
    itemId: number;
    completed: boolean;
    date: Date;
}

export interface Streak {
    id?: number;
    userId: number | 'guest';
    currentStreak: number;
    lastActive: Date;
}

export class IbadahDatabase extends Dexie {
    users!: Table<LocalUser>;
    dhikr_logs!: Table<DhikrLog>;
    quran_progress!: Table<QuranProgress>;
    streaks!: Table<Streak>;

    constructor() {
        super('IbadahTrackDB');
        this.version(1).stores({
            users: '++id, email, role',
            dhikr_logs: '++id, userId, date',
            quran_progress: '++id, userId, itemId',
            streaks: '++id, userId'
        });
    }
}

export const db = new IbadahDatabase();

// Seed data: Create an admin account if none exists
export async function seedAdmin() {
    const adminExists = await db.users.where('role').equals('admin').first();
    if (!adminExists) {
        await db.users.add({
            email: 'admin@ibadahtrack.local',
            password: 'password123',
            name: 'System Admin',
            role: 'admin',
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
            onboarded: true,
            current_ramadan_day: 1,
            total_xp: 0,
            created_at: new Date(),
            updated_at: new Date()
        });
        console.log('Admin account seeded: admin@ibadahtrack.local / password123');
    }
}

seedAdmin();
