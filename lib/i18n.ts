export type Locale = 'en' | 'ar'

export const LOCALES: Locale[] = ['en', 'ar']
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'eldevo_locale'

export const dictionary = {
  en: {
    skip: 'Skip to content',
    nav: { finder: 'AI Finder', tools: 'Tools', categories: 'Categories', compare: 'Compare', guides: 'Guides' },
    auth: { signIn: 'Sign In', getStarted: 'Get Started', favorites: 'Favorites', collections: 'Collections', dashboard: 'Dashboard', admin: 'Admin', logout: 'Logout', signingOut: 'Signing out...' },
    footer: { description: 'AI tools intelligence for better decisions and workflows.', explore: 'Explore', resources: 'Resources', trust: 'Trust', aiTools: 'AI Tools', compareTools: 'Compare Tools', aiGuides: 'AI Guides', submit: 'Submit a tool', about: 'About Eldevo', privacy: 'Privacy', disclosure: 'Affiliate disclosure', curated: 'Curated AI directory', cta: 'Find your next AI tool' },
    language: 'العربية',
  },
  ar: {
    skip: 'تخطي إلى المحتوى',
    nav: { finder: 'مكتشف أدوات الذكاء الاصطناعي', tools: 'الأدوات', categories: 'التصنيفات', compare: 'مقارنة', guides: 'الأدلة' },
    auth: { signIn: 'تسجيل الدخول', getStarted: 'ابدأ الآن', favorites: 'المفضلة', collections: 'المجموعات', dashboard: 'لوحة التحكم', admin: 'الإدارة', logout: 'تسجيل الخروج', signingOut: 'جارٍ تسجيل الخروج...' },
    footer: { description: 'ذكاء أدوات الذكاء الاصطناعي لاتخاذ قرارات أفضل وبناء سير عمل أكثر كفاءة.', explore: 'استكشف', resources: 'الموارد', trust: 'الثقة', aiTools: 'أدوات الذكاء الاصطناعي', compareTools: 'مقارنة الأدوات', aiGuides: 'أدلة الذكاء الاصطناعي', submit: 'أضف أداة', about: 'عن Eldevo', privacy: 'الخصوصية', disclosure: 'الإفصاح عن الروابط التابعة', curated: 'دليل أدوات ذكاء اصطناعي موثوق', cta: 'اعثر على أداة الذكاء الاصطناعي المناسبة' },
    language: 'English',
  },
} as const

export function normalizeLocale(value?: string | null): Locale {
  return value === 'ar' ? 'ar' : 'en'
}

export function getDictionary(locale: Locale) {
  return dictionary[locale]
}
