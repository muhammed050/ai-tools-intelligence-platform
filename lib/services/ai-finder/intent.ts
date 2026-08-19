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
  const features = ['no watermark','watermark','api','voice cloning','commercial use','text-to-video','image-to-video','batch','team'].filter(x => q.includes(x)).map(x => x === 'watermark' ? 'no-watermark' : x);
  let category: string | undefined;
  if (/video|tiktok|youtube|reel|animation/.test(q)) category='video';
  else if (/image|photo|product photo|background/.test(q)) category='image';
  else if (/seo|article|blog|write|copy/.test(q)) category='writing';
  else if (/code|website|app|program/.test(q)) category='coding';
  else if (/voice|speech|audio|podcast/.test(q)) category='voice';
  else if (/marketing|ads|campaign/.test(q)) category='marketing';
  const budget = /\bfree\b|without paying|no cost/.test(q) ? 'free' : /free trial/.test(q) ? 'freemium' : 'any';
  const duration = q.match(/\b(\d+)\s*(?:second|seconds|sec)\b/)?.[1];
  return { category, useCase: category==='video' ? 'short-form video' : undefined, budget, features, constraints:[...(duration ? [`${duration} seconds`] : []), ...(q.includes('cartoon') ? ['cartoon style'] : []), ...(q.includes('no watermark') ? ['no watermark'] : [])] };
}

export async function extractIntent(query: string): Promise<{ intent: FinderIntent; source: 'ai' | 'development-fallback' }> {
  const provider = getAIProvider();
  if (!provider) return { intent: deterministicFallbackParser(query), source: 'development-fallback' };
  try {
    const raw = await provider.generateStructuredOutput<FinderIntent>({
      system: 'Extract only facts explicitly implied by the user request. Never invent tool names or capabilities. Normalize common feature names. Return empty optional fields when unknown.',
      user: query, schema,
    });
    return { intent: finderIntentSchema.parse(raw), source: 'ai' };
  } catch (error) {
    console.error('AI Finder intent extraction failed; using local parser', error);
    return { intent: deterministicFallbackParser(query), source: 'development-fallback' };
  }
}