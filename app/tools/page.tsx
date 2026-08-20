import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowRight, CheckCircle2, Search, Sparkles } from 'lucide-react'
import { getDictionary, normalizeLocale, LOCALE_COOKIE } from '@/lib/i18n'

export const metadata = { title: 'AI Tools Directory', description: 'Browse and compare curated AI tools for writing, coding, image, video, voice, research and business.' }
type SearchParams = { q?: string; category?: string; pricing?: string; rating?: string; platform?: string; verified?: string; sort?: string }
const pricingOptions = ['free', 'freemium', 'paid', 'free_trial', 'contact_sales']
function sanitizeSearchQuery(value: string) { return value.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim() }
const arPricing: Record<string, string> = { free: 'مجاني', freemium: 'مجاني مع ميزات مدفوعة', paid: 'مدفوع', free_trial: 'تجربة مجانية', contact_sales: 'تواصل مع المبيعات' }

export default async function Tools({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const locale = normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value)
  const ar = locale === 'ar'
  const t = getDictionary(locale)
  const params = await searchParams
  const queryText = sanitizeSearchQuery(params.q || '')
  let data: any[] = []; let categories: any[] = []
  try {
    const db = await createClient()
    const [categoryResult, toolResult] = await Promise.all([
      db.from('categories').select('name, name_ar, slug').order('name'),
      (async () => {
        let query = db.from('tools').select('id,name,name_ar,slug,short_description,short_description_ar,rating,review_count,pricing_type,logo_url,verified,featured,platforms,category:categories!inner(name,name_ar,slug)').eq('status', 'published')
        if (queryText) query = query.or(`name.ilike.%${queryText}%,name_ar.ilike.%${queryText}%,short_description.ilike.%${queryText}%,short_description_ar.ilike.%${queryText}%`)
        if (params.category) query = query.eq('categories.slug', params.category)
        if (params.pricing) query = query.eq('pricing_type', params.pricing)
        if (params.platform) query = query.contains('platforms', [params.platform])
        if (params.verified === 'true') query = query.eq('verified', true)
        if (params.rating) query = query.gte('rating', Number(params.rating))
        if (params.sort === 'newest') query = query.order('created_at', { ascending: false }); else if (params.sort === 'az') query = query.order(ar ? 'name_ar' : 'name', { ascending: true }); else if (params.sort === 'reviews') query = query.order('review_count', { ascending: false, nullsFirst: false }); else query = query.order('featured', { ascending: false }).order('rating', { ascending: false, nullsFirst: false })
        return query.limit(60)
      })()
    ])
    categories = categoryResult.data || []; data = toolResult.data || []
  } catch (error) { console.error('Directory unavailable', error) }

  return <main className="container" style={{ padding: '58px 0 90px' }}>
    <div className="section-head"><div><div className="eyebrow">{ar ? 'دليل مختار بعناية' : 'Curated directory'}</div><h1 style={{ fontSize: 46, letterSpacing: '-.04em', margin: '6px 0' }}>{ar ? 'استكشف أدوات الذكاء الاصطناعي' : 'Explore AI tools'}</h1><p className="muted">{data.length ? (ar ? `${data.length} أداة متاحة تطابق بحثك.` : `${data.length} published tools matched your search.`) : (ar ? 'اكتشف برامج ذكاء اصطناعي مفيدة مرتبة حسب الصلة والجودة.' : 'Discover useful AI software, sorted by relevance and quality.')}</p></div><Link className="btn btn-primary" href="/ai-finder"><Sparkles size={16} /> {ar ? 'اسأل مكتشف الذكاء الاصطناعي' : 'Ask AI Finder'}</Link></div>
    <form className="card directory-filters" action="/tools">
      <div className="directory-search"><Search size={18} /><input name="q" defaultValue={queryText} placeholder={ar ? 'ابحث باسم الأداة أو حسب الاستخدام' : 'Search by tool name or use case'} aria-label={ar ? 'البحث عن أدوات الذكاء الاصطناعي' : 'Search AI tools'} /></div>
      <select name="category" defaultValue={params.category || ''} aria-label={ar ? 'التصفية حسب التصنيف' : 'Filter by category'}><option value="">{ar ? 'كل التصنيفات' : 'All categories'}</option>{categories.map((category) => <option value={category.slug} key={category.slug}>{ar ? (category.name_ar || category.name) : category.name}</option>)}</select>
      <select name="pricing" defaultValue={params.pricing || ''} aria-label={ar ? 'التصفية حسب السعر' : 'Filter by pricing'}><option value="">{ar ? 'كل الأسعار' : 'All pricing'}</option>{pricingOptions.map((pricing) => <option value={pricing} key={pricing}>{ar ? arPricing[pricing] : pricing.replace('_', ' ')}</option>)}</select>
      <select name="rating" defaultValue={params.rating || ''} aria-label={ar ? 'التصفية حسب التقييم' : 'Filter by rating'}><option value="">{ar ? 'أي تقييم' : 'Any rating'}</option><option value="4">{ar ? '4 نجوم فأكثر' : '4+ stars'}</option><option value="4.5">{ar ? '4.5 نجوم فأكثر' : '4.5+ stars'}</option></select>
      <select name="platform" defaultValue={params.platform || ''} aria-label={ar ? 'التصفية حسب المنصة' : 'Filter by platform'}><option value="">{ar ? 'أي منصة' : 'Any platform'}</option><option value="web">Web</option><option value="ios">iOS</option><option value="android">Android</option><option value="api">API</option></select>
      <select name="sort" defaultValue={params.sort || ''} aria-label={ar ? 'ترتيب الأدوات' : 'Sort tools'}><option value="">{ar ? 'الأكثر صلة' : 'Most relevant'}</option><option value="reviews">{ar ? 'الأكثر تقييمًا' : 'Most reviewed'}</option><option value="newest">{ar ? 'الأحدث إضافة' : 'Recently added'}</option><option value="az">{ar ? 'أبجديًا' : 'A-Z'}</option></select>
      <label className="filter-check"><input type="checkbox" name="verified" value="true" defaultChecked={params.verified === 'true'} /> {ar ? 'الموثقة فقط' : 'Verified only'}</label><button className="btn btn-primary" type="submit">{ar ? 'تطبيق الفلاتر' : 'Apply filters'}</button>
    </form>
    {!data.length ? <div className="card directory-empty"><h2>{ar ? 'لا توجد أدوات مطابقة' : 'No matching tools'}</h2><p className="muted">{ar ? 'جرّب بحثًا أوسع أو أزل أحد الفلاتر أو صف هدفك في مكتشف الذكاء الاصطناعي.' : 'Try a broader search, remove a filter, or describe your goal in AI Finder.'}</p><Link className="btn btn-secondary" href="/ai-finder">{ar ? 'جرّب مكتشف الذكاء الاصطناعي' : 'Try AI Finder'} <ArrowRight size={15} /></Link></div> : <div className="tool-grid">{data.map((tool: any) => { const category = Array.isArray(tool.category) ? tool.category[0] : tool.category; const name = ar ? (tool.name_ar || tool.name) : tool.name; const description = ar ? (tool.short_description_ar || tool.short_description) : tool.short_description; const categoryName = ar ? (category?.name_ar || category?.name || 'برنامج ذكاء اصطناعي') : (category?.name || 'AI software'); return <article className="card tool-card" key={tool.id}><Link href={`/tools/${tool.slug}`} className="tool-card-link"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div className="tool-logo">{tool.logo_url ? <img src={tool.logo_url} alt={`${name} logo`} width={32} height={32} /> : name.slice(0, 1)}</div>{tool.verified && <span className="badge"><CheckCircle2 size={13} /> {ar ? 'موثقة' : 'Verified'}</span>}</div><div className="muted" style={{ fontSize: 12, marginTop: 15 }}>{categoryName}</div><h2 style={{ fontSize: 20, margin: '4px 0' }}>{name}</h2><p className="muted" style={{ margin: '0 0 14px' }}>{description}</p><div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 'auto', fontSize: 13 }}><span>★ {tool.rating ?? (ar ? 'بدون تقييم' : 'Unrated')} {tool.review_count ? `(${tool.review_count})` : ''}</span><span className="badge">{ar ? (arPricing[tool.pricing_type] || 'السعر غير معروف') : (tool.pricing_type || 'Pricing unknown')}</span></div></Link><div className="tool-card-actions"><Link className="btn btn-secondary" href={`/compare?tool=${tool.slug}`}>{ar ? 'مقارنة' : 'Compare'}</Link><Link className="btn btn-primary" href={`/tools/${tool.slug}`}>{ar ? 'عرض التفاصيل' : 'View details'} <ArrowRight size={14} /></Link></div></article> })}</div>}
  </main>
}
