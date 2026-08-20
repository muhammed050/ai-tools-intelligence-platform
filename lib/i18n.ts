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
      eyebrow: 'AI Tool Decision Engine', title: 'Tell us what you want to accomplish.', title2: 'We will choose the right tools.', description: 'Stop searching thousands of AI tools. Describe your goal, budget and constraints and Eldevo will extract your intent and rank the best-fit tools.', placeholder: 'e.g. free AI video generator for short TikTok clips with no watermark', aria: 'Describe what you want to accomplish', finding: 'Analyzing your request...', find: 'Find the right tools', unavailable: 'Smart ranking is temporarily unavailable.', fallback: 'Here are the best matches from the Eldevo directory.', detected: 'Detected intent', ai: 'AI analysis', local: 'Local analysis', match: 'match', matches: 'matches', why: 'Why we recommend it', strong: 'A strong match based on your request.', limitations: 'Limitations:', visit: 'Try tool', details: 'Details', compare: 'Compare', verified: 'Verified', unrated: 'Unrated', unavailableError: 'The Finder is temporarily unavailable. Please try again.', stackTitle: 'Your recommended AI stack', stackDescription: 'Instead of picking one tool, Eldevo builds a practical set of complementary tools for your task.', stackStep: 'Role', stackOpen: 'Open tool', stackEyebrow: 'A solution, not just a tool', genericTool: 'AI tool', free: 'Free', category: 'Category', budget: 'Budget', bestMatch: 'Best match', bestFree: 'Best free option', bestValue: 'Best value', alternatives: 'Best Alternative', premium: 'Best Premium Option', noResults: 'No strong matches yet. Try describing your goal in more detail.',
    },
    language: 'العربية',
  },
  ar: {
    skip: 'تخطي إلى المحتوى',
    nav: { finder: 'مكتشف أدوات الذكاء الاصطناعي', tools: 'الأدوات', categories: 'التصنيفات', compare: 'مقارنة', guides: 'الأدلة' },
    auth: { signIn: 'تسجيل الدخول', getStarted: 'ابدأ الآن', favorites: 'المفضلة', collections: 'المجموعات', dashboard: 'لوحة التحكم', admin: 'الإدارة', logout: 'تسجيل الخروج', signingOut: 'جارٍ تسجيل الخروج...' },
    footer: { description: 'ذكاء أدوات الذكاء الاصطناعي لاتخاذ قرارات أفضل وبناء سير عمل أكثر كفاءة.', explore: 'استكشف', resources: 'الموارد', trust: 'الثقة', aiTools: 'أدوات الذكاء الاصطناعي', compareTools: 'مقارنة الأدوات', aiGuides: 'أدلة الذكاء الاصطناعي', submit: 'أضف أداة', about: 'عن Eldevo', privacy: 'الخصوصية', disclosure: 'الإفصاح عن الروابط التابعة', curated: 'دليل أدوات ذكاء اصطناعي موثوق', cta: 'اعثر على أداة الذكاء الاصطناعي المناسبة' },
    finder: {
      eyebrow: 'محرك اتخاذ قرار أدوات الذكاء الاصطناعي', title: 'أخبرنا بما تريد إنجازه.', title2: 'وسنختار الأدوات المناسبة.', description: 'توقف عن البحث بين آلاف أدوات الذكاء الاصطناعي. صف هدفك وميزانيتك وقيودك، وسيحلل Eldevo طلبك ويرتب الأدوات الأنسب.', placeholder: 'مثال: أداة مجانية لإنشاء فيديوهات TikTok قصيرة بدون علامة مائية', aria: 'صف ما تريد إنجازه', finding: 'جارٍ تحليل طلبك...', find: 'اعثر على الأدوات المناسبة', unavailable: 'الترتيب الذكي غير متاح مؤقتًا.', fallback: 'إليك أفضل النتائج المطابقة من دليل Eldevo.', detected: 'النية المكتشفة', ai: 'تحليل بالذكاء الاصطناعي', local: 'تحليل محلي', match: 'مطابقة', matches: 'مطابقات', why: 'لماذا نوصي بها', strong: 'مطابقة قوية بناءً على طلبك.', limitations: 'القيود:', visit: 'جرّب الأداة', details: 'التفاصيل', compare: 'قارن', verified: 'موثّقة', unrated: 'بلا تقييم', unavailableError: 'مكتشف الأدوات غير متاح مؤقتًا. حاول مرة أخرى.', stackTitle: 'مجموعة أدواتك المقترحة', stackDescription: 'بدل اختيار أداة واحدة، يبني Eldevo لك مجموعة عملية من الأدوات التي تكمل بعضها لمهمتك.', stackStep: 'الدور', stackOpen: 'افتح الأداة', stackEyebrow: 'حل متكامل، وليس مجرد أداة', genericTool: 'أداة ذكاء اصطناعي', free: 'مجاني', category: 'التصنيف', budget: 'الميزانية', bestMatch: 'أفضل تطابق', bestFree: 'أفضل خيار مجاني', bestValue: 'أفضل قيمة', alternatives: 'أفضل بديل', premium: 'أفضل خيار مدفوع', noResults: 'لم نجد تطابقات قوية بعد. حاول وصف هدفك بمزيد من التفاصيل.',
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
