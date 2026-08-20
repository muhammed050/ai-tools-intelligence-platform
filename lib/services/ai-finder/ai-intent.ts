import type { FinderIntent } from './types';
import { finderIntentSchema, deterministicFallbackParser } from './intent';
import { getAIDecisionGateway } from '../ai/provider';

const intentJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    category: { type: 'string' },
    subcategory: { type: 'string' },
    useCase: { type: 'string' },
    budget: { type: 'string', enum: ['free', 'freemium', 'paid', 'any'] },
    features: { type: 'array', items: { type: 'string' } },
    platform: { type: 'array', items: { type: 'string' } },
    language: { type: 'string' },
    experienceLevel: { type: 'string' },
    outputType: { type: 'string' },
    constraints: { type: 'array', items: { type: 'string' } },
  },
  required: [],
};

export async function extractAIIntent(query: string): Promise<{ intent: FinderIntent; source: string }> {
  const fallback = deterministicFallbackParser(query);
  const gateway = getAIDecisionGateway();
  if (!gateway) return { intent: finderIntentSchema.parse(fallback), source: 'deterministic' };
  try {
    const intent = await gateway.generateStructuredOutput<FinderIntent>({
      system: 'You are ElDevo AI Finder intent extraction. Understand Arabic and English naturally. Extract only requirements explicitly stated or strongly implied. Never invent a budget, platform, feature, or constraint. Keep values concise and useful for matching AI tools.',
      user: query,
      schema: intentJsonSchema,
    });
    return { intent: finderIntentSchema.parse(intent), source: 'multi-model' };
  } catch {
    return { intent: finderIntentSchema.parse(fallback), source: 'deterministic-fallback' };
  }
}
