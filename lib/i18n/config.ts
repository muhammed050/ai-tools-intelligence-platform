export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const localeMeta = { en: { name: 'English', dir: 'ltr' }, ar: { name: 'العربية', dir: 'rtl' } } as const;
