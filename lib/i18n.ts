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
    finder: {
      title: 'Find the right AI tool for your goal',
      subtitle: 'Tell Eldevo what you want to accomplish. We will match the tools to your task, budget, and priorities.',
      placeholder: 'What do you want to accomplish?',
      recommend: 'Get recommendations',
      bestMatch: 'Best match',
      bestFree: 'Best free option',
      bestValue: 'Best value',
      why: 'Why this tool?',
      alternatives: 'Alternatives',
      stack: 'Recommended AI Stack',
      budget: 'Budget',
      free: 'Free',
      compare: 'Compare options',
      noResults: 'No strong matches yet. Try describing your goal in more detail.',
    },
    language: 'العربية',
  },
  ar: {
    skip: 'تخطي إلى المحتوى',
    nav: { finder: 'مكتشف أدوات الذكاء الاصطناعي', tools: 'الأدوات', categories: 'التصنيفات', compare: 'مقارنة', guides: 'الأدلة' },
    auth: { signIn: 'تسجيل الدخول', getStarted: 'ابدأ الآن', favorites: 'المفضلة', collections: 'المجموعات', dashboard: 'لوحة التحكم', admin: 'الإدارة', logout: 'تسجيل الخروج', signingOut: 'جارٍ تسجيل الخروج...' },
    footer: { description: 'ذكاء أدوات الذكاء الاصطناعي لاتخاذ قرارات أفضل وبناء سير عمل أكثر كفاءة.', explore: 'استكشف', resources: 'الموارد', trust: 'الثقة', aiTools: 'أدوات الذكاء الاصطناعي', compareTools: 'مقارنة الأدوات', aiGuides: 'أدلة الذكاء الاصطناعي', submit: 'أضف أداة', about: 'عن Eldevo', privacy: 'الخصوصية', disclosure: 'الإفصاح عن الروابط التابعة', curated: 'دليل أدوات ذكاء اصطناعي موثوق', cta: 'اعثر على أداة الذكاء الاصطناعي المناسبة' },
    finder: {
      title: 'اعثر على أداة الذكاء الاصطناعي المناسبة لهدفك',
      subtitle: 'أخبر Eldevo بما تريد إنجازه، وسنطابق الأدوات مع مهمتك وميزانيتك وأولوياتك.',
      placeholder: 'ماذا تريد أن تنجز؟',
      recommend: 'احصل على التوصيات',
      bestMatch: 'أفضل تطابق',
      bestFree: 'أفضل خيار مجاني',
      bestValue: 'أفضل قيمة',
      why: 'لماذا هذه الأداة؟',
      alternatives: 'البدائل',
      stack: 'مجموعة أدوات AI المقترحة',
      budget: 'الميزانية',
      free: 'مجاني',
      compare: 'قارن الخيارات',
      noResults: 'لم نجد تطابقات قوية بعد. حاول وصف هدفك بمزيد من التفاصيل.',
    },
    language: 'English',
  },
} as const

export function normalizeLocale(value?: string | null): Locale {
  return value === 'ar' ? 'ar' : 'en'
}

export function getDictionary(locale: Locale) {
  return dictionary[locale]
}
