import { z } from 'zod';
import { getAIProvider } from '../ai/provider';
import type { FinderIntent } from './types';

export const finderIntentSchema = z.object({
  category: z.string().optional(), subcategory: z.string().optional(), useCase: z.string().optional(),
  budget: z.enum(['free','freemium','paid','any']).optional(), features: z.array(z.string()).optional(),
  platform: z.array(z.string()).optional(), language: z.string().optional(), experienceLevel: z.string().optional(),
  outputType: z.string().optional(), constraints: z.array(z.string()).optional(),
});

const schema = { type:'object', properties:{ category:{type:'string'}, subcategory:{type:'string'}, useCase:{type:'string'}, budget:{type:'string',enum:['free','freemium','paid','any']}, features:{type:'array',items:{type:'string'}}, platform:{type:'array',items:{type:'string'}}, language:{type:'string'}, experienceLevel:{type:'string'}, outputType:{type:'string'}, constraints:{type:'array',items:{type:'string'}} }, additionalProperties:false };

export function deterministicFallbackParser(query: string): FinderIntent {
  const q = query.toLowerCase();
  const features = [
    'no watermark','watermark','api','voice cloning','commercial use','text-to-video','image-to-video','batch','team',
    'بدون علامة مائية','علامة مائية','واجهة برمجية','استنساخ الصوت','استخدام تجاري','نص إلى فيديو','صورة إلى فيديو','دفعي','فريق',
  ].filter(x => q.includes(x)).map(x => x === 'watermark' || x === 'علامة مائية' ? 'no-watermark' : x);

  let category: string | undefined;
  if (/video|tiktok|youtube|reel|animation|فيديو|تيك.?توك|يوتيوب|ريلز|رسوم متحركة/.test(q)) category='video';
  else if (/image|photo|product photo|background|صورة|صور|منتج|خلفية/.test(q)) category='image';
  else if (/seo|article|blog|write|copy|سيو|مقال|مقالات|مدونة|كتابة|محتوى/.test(q)) category='writing';
  else if (/code|website|app|program|برمجة|موقع|تطبيق|كود|برنامج/.test(q)) category='coding';
  else if (/voice|speech|audio|podcast|صوت|كلام|صوتي|بودكاست/.test(q)) category='voice';
  else if (/marketing|ads|campaign|تسويق|إعلانات|حملة|مبيعات/.test(q)) category='marketing';

  const budget = /\bfree\b|without paying|no cost|مجاني|مجانية|بلا مقابل|بدون دفع/.test(q)
    ? 'free'
    : /free trial|تجربة مجانية/.test(q) ? 'freemium' : 'any';

  const duration = q.match(/\b(\d+)\s*(?:second|seconds|sec|ثانية|ثواني)\b/)?.[1];
  const cartoon = /cartoon|كرتون|كرتوني/.test(q);
  const noWatermark = /no watermark|بدون علامة مائية/.test(q);

  return {
    category,
    useCase: category === 'video' ? 'short-form video' : undefined,
    budget,
    features,
    constraints: [
      ...(duration ? [`${duration} seconds`] : []),
      ...(cartoon ? ['cartoon style'] : []),
      ...(noWatermark ? ['no watermark'] : []),
    ],
  };
}

export async function extractIntent(query: string): Promise<{ intent: FinderIntent; source: 'ai' | 'development-fallback' }> {
  const provider = getAIProvider();
  if (!provider) return { intent: deterministicFallbackParser(query), source: 'development-fallback' };
  try {
    const raw = await provider.generateStructuredOutput<FinderIntent>({
      system: 'Extract only facts explicitly implied by the user request. Support Arabic and English naturally. Never translate away important user constraints. Never invent tool names or capabilities. Normalize common feature names. Return empty optional fields when unknown.',
      user: query, schema,
    });
    return { intent: finderIntentSchema.parse(raw), source: 'ai' };
  } catch (error) {
    console.error('AI Finder intent extraction failed; using local parser', error);
    return { intent: deterministicFallbackParser(query), source: 'development-fallback' };
  }
}