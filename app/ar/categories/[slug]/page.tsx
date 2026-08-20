import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'

async function getCategory(slug: string) {
  const db = await createClient()
  const { data: category } = await db.from('categories').select('id,name,slug,description').eq('slug', slug).maybeSingle()
  if (!category) return null
  const { data: translation } = await db.from('category_translations').select('name,description,seo_title,seo_description').eq('category_id', category.id).eq('locale', 'ar').maybeSingle()
  const { data: tools } = await db.from('tools').select('id,name,name_ar,slug,short_description,short_description_ar,rating,review_count,pricing_type,logo_url,verified').eq('category_id', category.id).eq('status', 'published').order('featured', { ascending: false }).order('rating', { ascending: false, nullsFirst: false }).limit(24)
  return { category, translation, tools: tools || [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const result = await getCategory((await params).slug)
  if (!result) return { robots: { index: false, follow: true } }
  const { category, translation } = result; const site = getSiteUrl(); const en = `${site}/categories/${category.slug}`; const ar = `${site}/ar/categories/${category.slug}`
  const title = translation?.seo_title || `${translation?.name || category.name} — أدوات الذكاء الاصطناعي`
  const description = translation?.seo_description || translation?.description || category.description
  return { title, description, alternates: { canonical: ar, languages: { ar, en, 'x-default': en } }, openGraph: { type: 'website', title, description, url: ar, locale: 'ar_SA', alternateLocale: ['en_US'] }, robots: { index: true, follow: true } }
}

export default async function ArabicCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const result = await getCategory((await params).slug); if (!result) notFound(); const { category, translation, tools } = result
  const site = getSiteUrl(); const name = translation?.name || category.name; const description = translation?.description || category.description
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name, description, url: `${site}/ar/categories/${category.slug}`, inLanguage: 'ar' }
  return <main className="container" dir="rtl" style={{ padding: '58px 0 90px' }}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><nav className="muted" aria-label="مسار التنقل"><Link href="/ar/categories">التصنيفات</Link> / {name}</nav><div style={{ maxWidth: 760, marginTop: 18 }}><div className="eyebrow">تصنيف أدوات الذكاء الاصطناعي</div><h1 style={{ fontSize: 48, letterSpacing: '-.045em', margin: '7px 0 10px' }}>{name} — أدوات الذكاء الاصطناعي</h1><p className="muted" style={{ fontSize: 18 }}>{description}</p></div><section style={{ marginTop: 34 }}><div className="section-head"><div><h2>أفضل أدوات {name}</h2><p className="muted">أدوات مختارة مع إشارات الجودة والأسعار المتاحة.</p></div><Link className="btn btn-secondary" href="/ar/tools">تصفح الدليل <ArrowRight size={15} /></Link></div>{!tools.length ? <div className="card" style={{ padding: 28 }}><h3>يتم حاليًا إعداد الأدوات</h3><p className="muted">تصفح الدليل أو استخدم مكتشف أدوات الذكاء الاصطناعي.</p></div> : <div className="tool-grid">{tools.map((tool: any) => <Link className="card tool-card" href={`/ar/tools/${tool.slug}`} key={tool.id}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div className="tool-logo">{tool.logo_url ? <img src={tool.logo_url} alt="" width={32} height={32} /> : (tool.name_ar || tool.name).slice(0, 1)}</div>{tool.verified && <span className="badge"><CheckCircle2 size={13} /> موثقة</span>}</div><h3 style={{ margin: '18px 0 4px' }}>{tool.name_ar || tool.name}</h3><p className="muted" style={{ margin: 0 }}>{tool.short_description_ar || tool.short_description}</p><div style={{ marginTop: 'auto', paddingTop: 18, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>★ {tool.rating ?? '—'} {tool.review_count ? `(${tool.review_count})` : ''}</span><span>{tool.pricing_type}</span></div></Link>)}</div>}</section></main>
}
