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
  { pattern: /automation|automate|أتمتة|تلقائي|أتمتة/iu, value: 'automation' },
  { pattern: /templates?|قوالب/iu, value: 'templates' },
  { pattern: /subtitle|captions?|ترجمة|ترجمة تلقائية|تسميات/iu, value: 'subtitles' },
];

function firstMatch(query: string, rules: Array<[string, RegExp]>) {
  return rules.find(([, pattern]) => pattern.test(query))?.[0];
}

function detectBudget(q: string): FinderIntent['budget'] {
  if (/\bfree\b|without paying|no cost|zero cost|مجاني|مجانية|بلا مقابل|بدون دفع|بالمجان/iu.test(q)) return 'free';
  if (/free trial|trial|تجربة مجانية|فترة تجريبية/iu.test(q)) return 'freemium';
  if (/paid|premium|مدفوع|مدفوعة|احترافي/iu.test(q)) return 'paid';
  return 'any';
}

function detectExperience(q: string) {
  if (/beginner|new to|no experience|مبتدئ|مبتدئة|بدون خبرة|لا خبرة/iu.test(q)) return 'beginner';
  if (/advanced|expert|professional|متقدم|محترف|خبرة كبيرة/iu.test(q)) return 'advanced';
  if (/intermediate|متوسط/iu.test(q)) return 'intermediate';
  return undefined;
}

function detectPlatform(q: string) {
  const platforms: Array<[string, RegExp]> = [
    ['tiktok', /tiktok|تيك.?توك/iu],
    ['youtube', /youtube|يوتيوب/iu],
    ['instagram', /instagram|insta|انستغرام|إنستغرام/iu],
    ['web', /website|web|ويب|موقع/iu],
    ['mobile', /mobile|android|ios|هاتف|جوال/iu],
    ['windows', /windows|ويندوز/iu],
    ['mac', /mac|macos/iu],
  ];
  return platforms.filter(([, pattern]) => pattern.test(q)).map(([name]) => name);
}

export function deterministicFallbackParser(query: string): FinderIntent {
  const q = query.trim();
  const category = firstMatch(q, CATEGORY_RULES);
  const features = FEATURE_RULES.filter(rule => rule.pattern.test(q)).map(rule => rule.value);
  const platform = detectPlatform(q);
  const budget = detectBudget(q);
  const experienceLevel = detectExperience(q);
  const duration = q.match(/\b(\d+)\s*(?:second|seconds|sec|ثانية|ثواني)\b/iu)?.[1];
  const constraints: string[] = [];

  if (duration) constraints.push(`${duration} seconds`);
  if (/cartoon|anime|كرتون|كرتوني|أنمي/iu.test(q)) constraints.push('cartoon style');
  if (/fast|quick|quickly|سريع|بسرعة/iu.test(q)) constraints.push('fast workflow');
  if (/easy|simple|سهل|سهلة|بسيط|بسيطة/iu.test(q)) constraints.push('easy to use');
  if (/cheap|low budget|رخيص|أرخص|ميزانية منخفضة/iu.test(q)) constraints.push('low cost');

  return {
    category,
    useCase: category === 'video' ? (/tiktok|تيك.?توك|reel|ريلز/iu.test(q) ? 'short-form social video' : 'video creation') : undefined,
    budget,
    features,
    platform,
    experienceLevel,
    outputType: category === 'video' ? 'video' : category === 'image' ? 'image' : undefined,
    constraints,
  };
}

export function extractIntent(query: string): { intent: FinderIntent; source: 'deterministic' } {
  return { intent: finderIntentSchema.parse(deterministicFallbackParser(query)), source: 'deterministic' };
}
