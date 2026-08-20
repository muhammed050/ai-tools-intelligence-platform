import type { FinderIntent, ToolRecord, Recommendation } from '../ai-finder/types';

const weights = { relevance:.30, features:.20, price:.15, rating:.10, popularity:.10, freshness:.05, reliability:.05, conversion:.05 } as const;

function norm(value:number) { return Math.max(0, Math.min(1, value)); }
function textTokens(input:string) { return new Set(input.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean)); }
function featureFit(intent:FinderIntent, tool:ToolRecord) {
  const wanted = (intent.features||[]).map(x=>x.toLowerCase().replace(/\s+/g,'-'));
  if (!wanted.length) return .5;
  const have = new Set(tool.features.flatMap(f=>[f.slug.toLowerCase(),f.name.toLowerCase().replace(/\s+/g,'-')]));
  return wanted.filter(x=>have.has(x)).length/wanted.length;
}
function priceFit(intent:FinderIntent, tool:ToolRecord) {
  if (!intent.budget || intent.budget==='any') return .5;
  if (intent.budget==='free') return tool.pricing_type==='free' || tool.pricing_plans.some(p=>p.is_free) ? 1 : 0;
  if (intent.budget==='freemium') return ['free','freemium','free_trial'].includes(tool.pricing_type) ? 1 : .25;
  return ['paid','contact_sales'].includes(tool.pricing_type) ? 1 : .5;
}
function freshness(tool:ToolRecord) { if (!tool.last_verified_at) return .25; const days=(Date.now()-new Date(tool.last_verified_at).getTime())/86400000; return norm(1-days/180); }
function reliability(tool:ToolRecord) { return norm(((tool.health_score??50)/100)*.7 + (tool.verified?.3:0)); }

export function calculateRecommendationScore(intent:FinderIntent, tool:ToolRecord, semanticScore=0, keywordScore=0) {
  const relevance = norm(semanticScore*.65 + keywordScore*.35);
  const features = featureFit(intent,tool);
  const price = priceFit(intent,tool);
  const rating = tool.rating ? norm(tool.rating/5) : .5;
  const popularity = norm(Math.log10((tool.review_count||0)+1)/4);
  const fresh = freshness(tool);
  const reliable = reliability(tool);
  const conversion = .5;
  const score = 100*(relevance*weights.relevance + features*weights.features + price*weights.price + rating*weights.rating + popularity*weights.popularity + fresh*weights.freshness + reliable*weights.reliability + conversion*weights.conversion);
  return Math.round(score*10)/10;
}

export function explainMatch(intent:FinderIntent, tool:ToolRecord): { why:string[]; limitations:string[] } {
  const wanted = new Set((intent.features||[]).map(x=>x.toLowerCase().replace(/\s+/g,'-')));
  const why:string[]=[];
  const matchingFeatures=tool.features.filter(f=>wanted.has(f.slug.toLowerCase()) || wanted.has(f.name.toLowerCase().replace(/\s+/g,'-')));
  matchingFeatures.slice(0,3).forEach(f=>why.push(`Supports ${f.name}`));
  if (intent.category && tool.category?.slug===intent.category) why.push(`Matches the ${tool.category.name} category`);
  if (intent.useCase && tool.use_cases.some(x=>x.toLowerCase().includes(intent.useCase!.toLowerCase()))) why.push(`Built for ${intent.useCase}`);
  if (intent.budget==='free' && (tool.pricing_type==='free'||tool.pricing_plans.some(p=>p.is_free))) why.push('Fits your free-budget requirement');
  else if (intent.budget==='freemium' && ['free','freemium','free_trial'].includes(tool.pricing_type)) why.push('Offers a free or trial entry point');
  if ((tool.rating??0)>=4.5) why.push(`Highly rated at ${tool.rating}/5`);
  if (tool.verified) why.push('Verified by Eldevo');
  if ((tool.health_score??0)>=85) why.push('Strong reliability/health score');
  if (!why.length) why.push('Strongest overall match across relevance, features, pricing, rating and reliability');
  const limitations = tool.cons.slice(0,3);
  return { why:why.slice(0,5), limitations };
}

export function rankRecommendations(intent:FinderIntent, candidates:Array<{tool:ToolRecord;semanticScore:number;keywordScore:number}>): Recommendation[] {
  return candidates.map(x=>({ tool:x.tool, score:calculateRecommendationScore(intent,x.tool,x.semanticScore,x.keywordScore), semanticScore:x.semanticScore, keywordScore:x.keywordScore, ...explainMatch(intent,x.tool) })).sort((a,b)=>b.score-a.score);
}
