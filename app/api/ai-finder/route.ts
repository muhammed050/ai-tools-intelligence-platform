import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractAIIntent } from '@/lib/services/ai-finder/ai-intent';
import { hybridSearch } from '@/lib/services/search/hybrid-search';
import { rankRecommendations } from '@/lib/services/recommendations/score';
import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

const bodySchema = z.object({ query: z.string().trim().min(3).max(1000), locale: z.enum(['en', 'ar']).optional().default('en') });
function getRateLimitKey(request: Request, userId?: string) { if (userId) return `user:${userId}`; const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(); const realIp = request.headers.get('x-real-ip')?.trim(); const ip = forwarded || realIp || 'unknown'; return `ip:${createHash('sha256').update(ip).digest('hex')}`; }
function localizedTool(tool: any, locale: 'en' | 'ar') { if (locale !== 'ar') return tool; return { ...tool, name: tool.name_ar || tool.name, description: tool.description_ar || tool.description, short_description: tool.short_description_ar || tool.short_description, use_cases: tool.use_cases_ar?.length ? tool.use_cases_ar : tool.use_cases, pros: tool.pros_ar?.length ? tool.pros_ar : tool.pros, cons: tool.cons_ar?.length ? tool.cons_ar : tool.cons, category: tool.category ? { ...tool.category, name: tool.category.name_ar || tool.category.name } : tool.category }; }
function buildExplanation(top: any[], locale: 'en' | 'ar') { const best = top[0]; if (!best) return null; const reasons = best.why?.slice(0, 4) || []; if (locale === 'ar') return { summary: `اخترنا ${best.tool.name_ar || best.tool.name} كأفضل تطابق لطلبك بدرجة ${best.score}%.`, reasons: reasons.map((r: string) => r.replace('Supports ', 'يدعم ').replace('Has a free option', 'يتوفر بخيار مجاني').replace('Matches ', 'مطابق لفئة ').replace('Relevant to ', 'مناسب لـ ').replace('Suitable for beginners', 'مناسب للمبتدئين').replace('Verified by the platform', 'موثّق من المنصة').replace('Recently verified', 'تم التحقق منه مؤخرًا')), score: best.score }; return { summary: `We selected ${best.tool.name} as the strongest match for your request with a ${best.score}% match score.`, reasons, score: best.score }; }

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json()); const db = await createClient(); const { data: { user } } = await db.auth.getUser();
    const limit = user ? 100 : 10; const windowSeconds = user ? 86400 : 3600; const key = getRateLimitKey(request, user?.id);
    const { data: allowed, error: rateLimitError } = await db.rpc('consume_rate_limit', { p_key: key, p_limit: limit, p_window_seconds: windowSeconds });
    if (rateLimitError) return NextResponse.json({ error: 'Search is temporarily unavailable.' }, { status: 503 });
    if (!allowed) return NextResponse.json({ error: user ? 'Daily search limit reached. Please try again tomorrow.' : 'Hourly search limit reached. Please sign in or try again later.' }, { status: 429, headers: { 'Retry-After': String(windowSeconds) } });

    const { intent, source } = await extractAIIntent(body.query);
    const candidates = await hybridSearch(body.query, intent, 40); const ranked = rankRecommendations(intent, candidates); const top = ranked.slice(0, 12); const aiExplanation = buildExplanation(top, body.locale);
    const localizeItems = (items: any[]) => items.map(item => ({ ...item, tool: localizedTool(item.tool, body.locale) }));
    const freeItems = top.filter(x => x.tool.pricing_type === 'free' || x.tool.pricing_plans?.some((p: any) => p.is_free)).slice(0, 4);
    const premiumItems = top.filter(x => ['paid', 'contact_sales'].includes(x.tool.pricing_type)).slice(0, 4); const alternativeItems = top.slice(1, 5);
    const categories = [{ key: 'best', label: body.locale === 'ar' ? 'أفضل التطابقات' : 'Best Matches', items: localizeItems(top.slice(0, 6)) }, { key: 'free', label: body.locale === 'ar' ? 'أفضل الخيارات المجانية' : 'Best Free Options', items: localizeItems(freeItems) }, { key: 'alternative', label: body.locale === 'ar' ? 'بدائل قوية' : 'Strong Alternatives', items: localizeItems(alternativeItems) }, { key: 'premium', label: body.locale === 'ar' ? 'أفضل الخيارات المدفوعة' : 'Best Premium Options', items: localizeItems(premiumItems) }].filter(group => group.items.length);
    const seen = new Set<string>(); const stack = ranked.filter(item => { const category = item.tool.category?.slug || item.tool.category?.name || 'other'; if (seen.has(category)) return false; seen.add(category); return true; }).slice(0, 8).map(item => ({ key: item.tool.category?.slug || 'other', label: body.locale === 'ar' ? (item.tool.category?.name_ar || item.tool.category?.name || 'أداة ذكاء اصطناعي') : (item.tool.category?.name || 'AI tool'), tool: localizedTool(item.tool, body.locale), score: item.score, why: item.why?.[0] || (body.locale === 'ar' ? 'مطابقة قوية بناءً على طلبك.' : 'Strong match for your request.') }));
    const sessionHash = createHash('sha256').update(key).digest('hex'); const { error: logError } = await db.from('search_logs').insert({ user_id: user?.id ?? null, query: body.query, intent, filters: intent, session_hash: sessionHash, result_tool_ids: top.map(x => x.tool.id) }); if (logError) console.warn('Search log skipped:', logError.message);
    return NextResponse.json({ query: body.query, locale: body.locale, intent, source, aiExplanation, results: categories, stack, total: top.length });
  } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid search request' }, { status: 400 }); console.error(error); return NextResponse.json({ error: 'Unable to complete the search right now.' }, { status: 500 }); }
}
