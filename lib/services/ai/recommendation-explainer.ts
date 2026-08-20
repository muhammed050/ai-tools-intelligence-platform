import { z } from 'zod';
import { getAIProvider } from './provider';
import type { FinderIntent, Recommendation } from '../ai-finder/types';

const responseSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    bestChoiceReason: { type: 'string' },
    tips: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'bestChoiceReason', 'tips'],
  additionalProperties: false,
};

const parsedSchema = z.object({
  summary: z.string().min(1).max(500),
  bestChoiceReason: z.string().min(1).max(500),
  tips: z.array(z.string().min(1).max(250)).max(4),
});

export async function explainRecommendations(intent: FinderIntent, recommendations: Recommendation[], locale: 'en' | 'ar') {
  const provider = getAIProvider();
  if (!provider || !recommendations.length) return null;

  const top = recommendations.slice(0, 3).map((item) => ({
    name: locale === 'ar' ? (item.tool.name_ar || item.tool.name) : item.tool.name,
    description: locale === 'ar' ? (item.tool.short_description_ar || item.tool.short_description) : item.tool.short_description,
    score: item.score,
    why: item.why,
    limitations: item.limitations,
    pricing: item.tool.pricing_type,
  }));

  try {
    const raw = await provider.generateStructuredOutput({
      system: locale === 'ar'
        ? 'أنت مستشار أدوات ذكاء اصطناعي داخل Eldevo. اشرح للمستخدم لماذا تناسبه النتائج المعروضة. استخدم فقط المعلومات الموجودة في البيانات، ولا تخترع قدرات أو أسعارًا. اكتب بالعربية الواضحة والمختصرة.'
        : 'You are Eldevo AI decision advisor. Explain why the shown tools fit the user. Use only facts in the supplied data; never invent capabilities or pricing. Keep the answer concise and practical.',
      user: JSON.stringify({ intent, recommendations: top }),
      schema: responseSchema,
    });
    return parsedSchema.parse(raw);
  } catch (error) {
    console.error('AI recommendation explanation failed', error);
    return null;
  }
}
