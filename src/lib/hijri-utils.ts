/**
 * Utility functions for Hijri date conversions using the Intl API.
 */

export const HIJRI_MONTH_NAMES = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' ath-Thani",
    "Jumada al-Ula", "Jumada al-Akhira", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

export const HijriUtils = {
    /**
     * Converts a Gregorian date to Hijri parts.
     * @param date Gregorian date
     * @param offset Hijri offset in days (±2)
     */
    getHijriParts(date: Date, offset: number = 0) {
        // Adjust the date by the offset
        const adjustedDate = new Date(date);
        adjustedDate.setDate(adjustedDate.getDate() + offset);

        const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-uma', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });

        const parts = formatter.formatToParts(adjustedDate);
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
        const monthPart = parts.find(p => p.type === 'month')?.value || '1';
        let month = parseInt(monthPart);

        if (isNaN(month)) {
            // Fallback for when current locale returns month names
            const monthIndex = HIJRI_MONTH_NAMES.findIndex(m => m.toLowerCase().includes(monthPart.toLowerCase()));
            month = monthIndex !== -1 ? monthIndex + 1 : 1;
        }

        const year = parseInt(parts.find(p => p.type === 'year')?.value || '1');

        return { day, month, year };
    },

    /**
     * Gets the Hijri month name.
     * @param month Hijri month number (1-12)
     */
    getMonthName(month: number) {
        return HIJRI_MONTH_NAMES[month - 1] || '';
    },

    /**
     * Returns a string representation of the Hijri date range for a Gregorian month.
     */
    getHijriMonthRange(year: number, month: number, offset: number = 0) {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);

        const startH = this.getHijriParts(start, offset);
        const endH = this.getHijriParts(end, offset);

        if (startH.month === endH.month) {
            return `${this.getMonthName(startH.month)} ${startH.year}`;
        } else {
            return `${this.getMonthName(startH.month)} – ${this.getMonthName(endH.month)} ${endH.year}`;
        }
    },

    /**
     * Checks if a date falls within Ramadan.
     */
    isRamadan(date: Date, offset: number = 0) {
        const h = this.getHijriParts(date, offset);
        return h.month === 9;
    },

    /**
     * Finds the approximate Gregorian date for a Hijri day.
     */
    getGregorianFromHijri(hYear: number, hMonth: number, hDay: number, offset: number = 0) {
        // Start near the expected Gregorian date (AH 1447 ~ 2026/2027)
        let guess = new Date(hYear + 579, hMonth - 1, hDay);

        // Refine by checking parts
        for (let i = -100; i < 100; i++) {
            const test = new Date(guess);
            test.setDate(test.getDate() + i);
            const h = this.getHijriParts(test, offset);
            if (h.year === hYear && h.month === hMonth && h.day === hDay) {
                return test;
            }
        }
        return guess;
    },

    /**
     * Gets the Ramadan day for a date (1-30), or 0 if not Ramadan.
     */
    getRamadanDay(date: Date, offset: number = 0) {
        const h = this.getHijriParts(date, offset);
        return h.month === 9 ? h.day : 0;
    }
};
