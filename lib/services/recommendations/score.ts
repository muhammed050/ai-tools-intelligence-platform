import type { FinderIntent, ToolRecord, Recommendation } from '../ai-finder/types';
import { checkHardConstraints } from '../ai-finder/hard-constraints';

const weights = { intent: .30, features: .20, budget: .15, quality: .10, platform: .07, experience: .05, freshness: .05, reliability: .05, popularity: .03 } as const;
function norm(value: number) { return Math.max(0, Math.min(1, value)); }
function tokens(input: string) { return new Set(input.toLowerCase().split(/[^\p{L}\p{N}-]+/u).filter(Boolean)); }
function intentRelevance(intent: FinderIntent, tool: ToolRecord, semanticScore = 0, keywordScore = 0) {
  const requested = [intent.useCase, intent.subcategory, ...(intent.features || []), ...(intent.constraints || [])].filter(Boolean).join(' ');
  const corpus = [tool.name, tool.short_description, tool.description, ...tool.use_cases, ...tool.features.map(f => `${f.name} ${f.slug}`), tool.category?.name, tool.category?.slug].filter(Boolean).join(' ');
  const wanted = tokens(requested); const available = tokens(corpus);
  const lexical = wanted.size ? [...wanted].filter(t => available.has(t)).length / wanted.size : .5;
  const category = intent.category && tool.category?.slug === intent.category ? 1 : intent.category ? .35 : .5;
  return norm((semanticScore * .30) + (keywordScore * .20) + (lexical * .35) + (category * .15));
}
function featureFit(intent: FinderIntent, tool: ToolRecord) {
  const wanted = (intent.features || []).map(x => x.toLowerCase().replace(/\s+/g, '-'));
  if (!wanted.length) return .6;
  const have = new Set(tool.features.flatMap(f => [f.slug.toLowerCase(), f.name.toLowerCase().replace(/\s+/g, '-') ]));
  const hits = wanted.filter(x => have.has(x) || (x === 'no-watermark' && have.has('watermark-free')));
  return hits.length / wanted.length;
}
function budgetFit(intent: FinderIntent, tool: ToolRecord) {
  if (!intent.budget || intent.budget === 'any') return .6;
  const free = tool.pricing_type === 'free' || tool.pricing_plans.some(p => p.is_free);
  if (intent.budget === 'free') return free ? 1 : 0;
  if (intent.budget === 'freemium') return free || tool.pricing_type === 'freemium' || tool.pricing_type === 'free_trial' ? 1 : .2;
  return ['paid', 'contact_sales'].includes(tool.pricing_type) ? 1 : .5;
}
function platformFit(intent: FinderIntent, tool: ToolRecord) {
  if (!intent.platform?.length) return .6;
  const corpus = tokens([tool.short_description, tool.description, ...tool.use_cases, ...tool.features.map(f => f.name)].join(' '));
  const hits = intent.platform.filter(p => corpus.has(p.toLowerCase()));
  return hits.length ? hits.length / intent.platform.length : .25;
}
function experienceFit(intent: FinderIntent, tool: ToolRecord) {
  if (!intent.experienceLevel) return .6;
  const corpus = `${tool.short_description} ${tool.description} ${tool.use_cases.join(' ')}`.toLowerCase();
  if (intent.experienceLevel === 'beginner') return /easy|simple|beginner|سهل|بسيط/.test(corpus) ? 1 : .55;
  if (intent.experienceLevel === 'advanced') return /advanced|professional|pro|api|متقدم|محترف/.test(corpus) ? 1 : .55;
  return .65;
}
function freshness(tool: ToolRecord) { if (!tool.last_verified_at) return .25; const days = (Date.now() - new Date(tool.last_verified_at).getTime()) / 86400000; return norm(1 - days / 180); }
function reliability(tool: ToolRecord) { return norm(((tool.health_score ?? 50) / 100) * .7 + (tool.verified ? .3 : 0)); }
function quality(tool: ToolRecord) { return tool.rating ? norm(tool.rating / 5) : .5; }
function popularity(tool: ToolRecord) { return norm(Math.log10((tool.review_count || 0) + 1) / 4); }
export function calculateRecommendationScore(intent: FinderIntent, tool: ToolRecord, semanticScore = 0, keywordScore = 0) {
  return Math.round(100 * (intentRelevance(intent, tool, semanticScore, keywordScore) * weights.intent + featureFit(intent, tool) * weights.features + budgetFit(intent, tool) * weights.budget + quality(tool) * weights.quality + platformFit(intent, tool) * weights.platform + experienceFit(intent, tool) * weights.experience + freshness(tool) * weights.freshness + reliability(tool) * weights.reliability + popularity(tool) * weights.popularity) * 10) / 10;
}
export function explainMatch(intent: FinderIntent, tool: ToolRecord): { why: string[]; limitations: string[] } {
  const wanted = new Set((intent.features || []).map(x => x.toLowerCase().replace(/\s+/g, '-'))); const why: string[] = [];
  tool.features.filter(f => wanted.has(f.slug.toLowerCase()) || wanted.has(f.name.toLowerCase().replace(/\s+/g, '-'))).slice(0, 3).forEach(f => why.push(`Supports ${f.name}`));
  if (intent.budget === 'free' && (tool.pricing_type === 'free' || tool.pricing_plans.some(p => p.is_free))) why.push('Has a free option');
  if (intent.category && tool.category?.slug === intent.category) why.push(`Matches ${tool.category.name}`);
  if (intent.platform?.length) why.push(`Relevant to ${intent.platform.join(', ')}`);
  if (intent.experienceLevel === 'beginner') why.push('Suitable for beginners');
  if (tool.verified) why.push('Verified by the platform');
  if (tool.last_verified_at) why.push('Recently verified');
  return { why: why.slice(0, 6), limitations: tool.cons.slice(0, 3) };
}
export function rankRecommendations(intent: FinderIntent, candidates: Array<{ tool: ToolRecord; semanticScore: number; keywordScore: number }>): Recommendation[] {
  return candidates.flatMap(x => {
    const gate = checkHardConstraints(x.tool as unknown as Record<string, unknown>, intent);
    if (!gate.eligible) return [];
    return [{ tool: x.tool, score: calculateRecommendationScore(intent, x.tool, x.semanticScore, x.keywordScore), semanticScore: x.semanticScore, keywordScore: x.keywordScore, ...explainMatch(intent, x.tool) }];
  }).sort((a, b) => b.score - a.score);
}
