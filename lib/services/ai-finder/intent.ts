import { z } from 'zod';
import type { FinderIntent } from './types';

export const finderIntentSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  useCase: z.string().optional(),
  budget: z.enum(['free', 'freemium', 'paid', 'any']).optional(),
  features: z.array(z.string()).optional(),
  platform: z.array(z.string()).optional(),
  language: z.string().optional(),
  experienceLevel: z.string().optional(),
  outputType: z.string().optional(),
  constraints: z.array(z.string()).optional(),
});

type Rule = { pattern: RegExp; value: string };

const CATEGORY_RULES: Array<[string, RegExp]> = [
  ['video', /video|tiktok|youtube|reel|shorts|animation|فيديو|تيك.?توك|يوتيوب|ريلز|شورت|انيميشن|رسوم/iu],
  ['image', /image|photo|picture|background|product photo|صورة|صور|تصميم|خلفية|منتج/iu],
  ['writing', /seo|article|blog|write|copy|content|سيو|مقال|مقالات|مدونة|كتابة|محتوى|نسخ/iu],
  ['coding', /code|coding|website|web app|app|program|developer|برمجة|موقع|تطبيق|كود|برنامج|مطور/iu],
  ['voice', /voice|speech|audio|podcast|tts|صوت|كلام|صوتي|بودكاست|تحويل النص لصوت/iu],
  ['marketing', /marketing|ads|campaign|sales|تسويق|إعلانات|اعلان|حملة|مبيعات/iu],
  ['research', /research|search|papers|literature|بحث|أبحاث|دراسة|مصادر/iu],
  ['productivity', /productivity|notes|meeting|workflow|إنتاجية|ملاحظات|اجتماع|سير العمل/iu],
];

const FEATURE_RULES: Rule[] = [
  { pattern: /no watermark|watermark.?free|بدون علامة مائية|من دون علامة مائية|بدون شعار/iu, value: 'no-watermark' },
  { pattern: /api|واجهة برمجية|واجهة برمجة التطبيقات/iu, value: 'api' },
  { pattern: /voice cloning|clone voice|استنساخ الصوت|تقليد الصوت/iu, value: 'voice-cloning' },
  { pattern: /commercial use|commercial license|استخدام تجاري|ترخيص تجاري/iu, value: 'commercial-use' },
  { pattern: /text.?to.?video|نص إلى فيديو|تحويل النص إلى فيديو/iu, value: 'text-to-video' },
  { pattern: /image.?to.?video|صورة إلى فيديو|تحويل الصورة إلى فيديو/iu, value: 'image-to-video' },
  { pattern: /batch|bulk|دفعي|جماعي/iu, value: 'batch' },
  { pattern: /team|collaborat|فريق|تعاون/iu, value: 'team' },
  { pattern: /real.?time|live|مباشر|لحظي/iu, value: 'real-time' },
  { pattern: /automation|automate|أتمتة|تلقائي/iu, value: 'automation' },
  { pattern: /templates?|قوالب/iu, value: 'templates' },
  { pattern: /subtitle|captions?|ترجمة تلقائية|تسميات/iu, value: 'subtitles' },
];

const USE_CASE_RULES: Rule[] = [
  { pattern: /tiktok|shorts?|reels?|تيك.?توك|شورت|ريلز/iu, value: 'short-form social video' },
  { pattern: /youtube|يوتيوب/iu, value: 'youtube video' },
  { pattern: /podcast|بودكاست/iu, value: 'podcast' },
  { pattern: /logo|brand identity|شعار|هوية بصرية/iu, value: 'branding' },
  { pattern: /resume|cv|سيرة ذاتية/iu, value: 'resume' },
  { pattern: /presentation|slides?|عرض تقديمي|شرائح/iu, value: 'presentation' },
  { pattern: /landing page|صفحة هبوط/iu, value: 'landing page' },
  { pattern: /ecommerce|e-commerce|online store|متجر إلكتروني|متجر اونلاين/iu, value: 'ecommerce' },
  { pattern: /research paper|academic|ورقة بحثية|أكاديمي/iu, value: 'academic research' },
  { pattern: /meeting|اجتماع/iu, value: 'meeting' },
];

function firstMatch(query: string, rules: Array<[string, RegExp]>) { return rules.find(([, pattern]) => pattern.test(query))?.[0]; }
function allMatches(query: string, rules: Rule[]) { return rules.filter(rule => rule.pattern.test(query)).map(rule => rule.value); }

function detectBudget(q: string): FinderIntent['budget'] {
  if (/\bfree\b|without paying|no cost|zero cost|مجاني|مجانية|بلا مقابل|بدون دفع|بالمجان/iu.test(q)) return 'free';
  if (/free trial|trial|تجربة مجانية|فترة تجريبية/iu.test(q)) return 'freemium';
  if (/paid|premium|مدفوع|مدفوعة|احترافي/iu.test(q)) return 'paid';
  return 'any';
}
function detectExperience(q: string) {
  if (/beginner|new to|no experience|مبتدئ|مبتدئة|بدون خبرة|لا خبرة/iu.test(q)) return 'beginner';
  if (/advanced|expert|professional|متقدم|محترف|خبير|خبرة كبيرة/iu.test(q)) return 'advanced';
  if (/intermediate|متوسط/iu.test(q)) return 'intermediate';
  return undefined;
}
function detectPlatform(q: string) {
  const platforms: Array<[string, RegExp]> = [
    ['tiktok', /tiktok|تيك.?توك/iu], ['youtube', /youtube|يوتيوب/iu], ['instagram', /instagram|insta|انستغرام|إنستغرام/iu],
    ['web', /website|web app|web|ويب|موقع/iu], ['mobile', /mobile|android|ios|هاتف|جوال/iu], ['windows', /windows|ويندوز/iu], ['mac', /mac|macos/iu],
  ];
  return platforms.filter(([, pattern]) => pattern.test(q)).map(([name]) => name);
}
function detectLanguage(q: string) {
  if (/\b(arabic|عربي|العربية)\b/iu.test(q)) return 'ar';
  if (/\b(english|إنجليزي|انجليزي|الإنجليزية)\b/iu.test(q)) return 'en';
  return undefined;
}
function detectOutputType(q: string, category?: string) {
  if (/video|فيديو/iu.test(q)) return 'video';
  if (/image|photo|صورة|صور/iu.test(q)) return 'image';
  if (/audio|voice|sound|صوت|صوتي/iu.test(q)) return 'audio';
  if (/text|article|copy|نص|مقال|كتابة/iu.test(q)) return 'text';
  if (category === 'coding') return 'code';
  return undefined;
}

export function deterministicFallbackParser(query: string): FinderIntent {
  const q = query.trim();
  const category = firstMatch(q, CATEGORY_RULES);
  const useCases = allMatches(q, USE_CASE_RULES);
  const features = [...new Set(allMatches(q, FEATURE_RULES))];
  const platform = detectPlatform(q);
  const budget = detectBudget(q);
  const experienceLevel = detectExperience(q);
  const language = detectLanguage(q);
  const duration = q.match(/\b(\d+)\s*(?:second|seconds|sec|ثانية|ثواني)\b/iu)?.[1];
  const constraints: string[] = [];
  if (duration) constraints.push(`${duration} seconds`);
  if (/cartoon|anime|كرتون|كرتوني|أنمي/iu.test(q)) constraints.push('cartoon style');
  if (/fast|quick|quickly|سريع|بسرعة/iu.test(q)) constraints.push('fast workflow');
  if (/easy|simple|سهل|سهلة|بسيط|بسيطة/iu.test(q)) constraints.push('easy to use');
  if (/cheap|low budget|رخيص|أرخص|ميزانية منخفضة/iu.test(q)) constraints.push('low cost');
  if (/professional quality|high quality|احترافي|جودة عالية/iu.test(q)) constraints.push('high quality');
  if (/no signup|without signup|بدون تسجيل|من دون تسجيل/iu.test(q)) constraints.push('no signup');

  return {
    category,
    subcategory: useCases[0],
    useCase: useCases[0] || (category === 'video' ? 'video creation' : undefined),
    budget,
    features,
    platform,
    language,
    experienceLevel,
    outputType: detectOutputType(q, category),
    constraints,
  };
}

export function extractIntent(query: string): { intent: FinderIntent; source: 'deterministic' } {
  return { intent: finderIntentSchema.parse(deterministicFallbackParser(query)), source: 'deterministic' };
}
