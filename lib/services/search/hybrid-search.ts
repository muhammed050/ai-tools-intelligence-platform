import { createClient } from '@/lib/supabase/server';
import { getAIProvider } from '../ai/provider';
import type { ToolRecord } from '../ai-finder/types';

const select = `id,name,name_ar,slug,description,description_ar,short_description,short_description_ar,website_url,logo_url,pricing_type,starting_price,currency,rating,review_count,verified,featured,health_score,quality_score,last_verified_at,use_cases,use_cases_ar,platforms,pros,pros_ar,cons,cons_ar,category:categories(name,name_ar,slug),features:tool_features(feature:features(name,slug)),pricing_plans(name,price,currency,billing_period,is_free,features)`;

function flatten(row: any): ToolRecord {
  return {
    ...row,
    category: Array.isArray(row.category) ? row.category[0] ?? null : row.category,
    features: (row.features || []).map((x: any) => x.feature).filter(Boolean),
    pricing_plans: row.pricing_plans || [],
    use_cases: row.use_cases || [],
    use_cases_ar: row.use_cases_ar || [],
    pros: row.pros || [],
    pros_ar: row.pros_ar || [],
    cons: row.cons || [],
    cons_ar: row.cons_ar || [],
  };
}

export async function hybridSearch(query: string, intent: { category?: string; features?: string[]; budget?: string }, limit = 24) {
  const db = await createClient();
  const safeQuery = query.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
  const isArabic = /[\u0600-\u06ff]/u.test(safeQuery);

  const keyword = await db.rpc('search_tools', { search_query: safeQuery, match_count: Math.max(limit * 2, 24) });
  const keywordRows = (keyword.data || []) as { id: string; rank: number }[];
  let semanticRows: { id: string; similarity: number }[] = [];

  const provider = getAIProvider();
  if (provider) {
    try {
      const embedding = await provider.generateEmbedding(query);
      const result = await db.rpc('match_tools', { query_embedding: embedding, match_threshold: .25, match_count: Math.max(limit * 2, 24) });
      semanticRows = (result.data || []) as any;
    } catch {
      semanticRows = [];
    }
  }

  // Arabic queries must also search the Arabic fields because the RPC may only index English columns.
  const terms = safeQuery.split(/\s+/).filter(x => x.length > 1).slice(0, 10);
  let bilingualRows: any[] = [];
  if (isArabic && terms.length) {
    const filter = terms.flatMap(term => [
      `name_ar.ilike.%${term}%`,
      `short_description_ar.ilike.%${term}%`,
      `description_ar.ilike.%${term}%`,
    ]).join(',');
    const arabic = await db.from('tools').select(select).eq('status', 'published').or(filter).order('rating', { ascending: false, nullsFirst: false }).limit(Math.max(limit * 2, 24));
    bilingualRows = arabic.data || [];
  }

  const ids = [...new Set([
    ...keywordRows.map(x => x.id),
    ...semanticRows.map(x => x.id),
    ...bilingualRows.map(x => x.id),
  ])].slice(0, limit * 4);

  if (!ids.length) {
    if (!terms.length) return [] as { tool: ToolRecord; semanticScore: number; keywordScore: number }[];
    const fallbackFilter = terms.flatMap(term => [
      `name.ilike.%${term}%`,
      `name_ar.ilike.%${term}%`,
      `short_description.ilike.%${term}%`,
      `short_description_ar.ilike.%${term}%`,
      `description.ilike.%${term}%`,
      `description_ar.ilike.%${term}%`,
    ]).join(',');
    const fallback = await db.from('tools').select(select).eq('status', 'published').or(fallbackFilter).order('rating', { ascending: false, nullsFirst: false }).limit(limit);
    if (fallback.error) throw fallback.error;
    return (fallback.data || []).map((row: any) => ({ tool: flatten(row), semanticScore: 0, keywordScore: .5 }));
  }

  const { data, error } = await db.from('tools').select(select).in('id', ids).eq('status', 'published');
  if (error) throw error;

  const km = new Map(keywordRows.map(x => [x.id, x.rank]));
  const sm = new Map(semanticRows.map(x => [x.id, x.similarity]));
  const bilingual = new Set(bilingualRows.map(x => x.id));
  const maxK = Math.max(...keywordRows.map(x => x.rank), 1);

  return (data || []).map((row: any) => ({
    tool: flatten(row),
    semanticScore: sm.get(row.id) || 0,
    keywordScore: ((km.get(row.id) || 0) / maxK) + (bilingual.has(row.id) ? .25 : 0),
  })).filter(x => !intent.category || x.tool.category?.slug === intent.category || x.keywordScore > 0 || x.semanticScore > .35).sort((a, b) => (b.keywordScore + b.semanticScore) - (a.keywordScore + a.semanticScore)).slice(0, limit);
}
