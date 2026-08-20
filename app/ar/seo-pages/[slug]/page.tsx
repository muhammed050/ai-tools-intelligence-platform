import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { seoPages } from '@/app/seo-pages'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'

export function generateStaticParams() { return seoPages.filter((p) => p.slug !== 'best-ai-tools').map((p) => ({ slug: p.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const page = seoPages.find((p) => p.slug === slug)
  if (!page) return { robots: { index: false, follow: true } }
  const site = getSiteUrl(); const ar = `${site}/ar/seo-pages/${page.slug}`; const en = `${site}/seo-pages/${page.slug}`; const title = `أفضل ${page.title.replace(/^Best /, '')} | Eldevo`
  return { title, description: page.description, alternates: { canonical: ar, languages: { ar, en, 'x-default': en } }, openGraph: { type: 'article', title, description: page.description, url: ar, locale: 'ar_SA', alternateLocale: ['en_US'] }, robots: { index: true, follow: true } }
}

export default async function ArabicSeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const page = seoPages.find((p) => p.slug === slug)
  if (!page || page.slug === 'best-ai-tools') notFound()
  const db = await createClient(); const { data } = await db.from('tools').select('id,name,name_ar,slug,short_description,short_description_ar,logo_url,rating,review_count,pricing_type,verified').eq('status', 'published').order('rating', { ascending: false, nullsFirst: false }).limit(8)
  const tools = data || []; const site = getSiteUrl(); const ar = `${site}/ar/seo-pages/${page.slug}`
  const faq = [
    { q: `كيف أختار من ${page.title.replace(/^Best /, '')}؟`, a: 'استخدم Eldevo Finder واكتب مهمتك وميزانيتك والمنصة والميزات المطلوبة. يقوم Eldevo بترتيب الأدوات حسب احتياجاتك بدل افتراض أن أداة واحدة هي الأفضل للجميع.' },
    { q: 'هل هذه الأدوات مجانية؟', a: 'تختلف الأسعار حسب الأداة. راجع صفحة كل أداة لمعرفة معلومات التسعير الحالية وتحقق من السعر النهائي لدى مزود الخدمة قبل الشراء.' },
    { q: 'هل يستطيع Eldevo المقارنة بين الأدوات؟', a: 'نعم. ابدأ من Eldevo Finder لوصف ما تحتاجه، ثم قارن الأدوات المرشحة قبل زيارة موقع المزود.' },
  ]
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) }
  const collectionSchema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: page.title, description: page.description, url: ar, inLanguage: 'ar', isPartOf: { '@type': 'WebSite', name: 'Eldevo', url: site } }
  return <main className="container" dir="rtl" style={{ padding: '58px 0 100px' }}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><nav className="muted" aria-label="مسار التنقل"><Link href={"/ar" as any}>Eldevo</Link> / <Link href={"/ar/tools" as any}>أدوات الذكاء الاصطناعي</Link> / {page.title}</nav><section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '16px auto 0' }}><div className="tool-logo" style={{ margin: '0 auto 15px' }}><Sparkles size={23} /></div><div className="eyebrow">{page.eyebrow}</div><h1 style={{ fontSize: 'clamp(40px,6vw,64px)', lineHeight: 1, letterSpacing: '-.05em' }}>{page.title.replace(/^Best /, 'أفضل ')}</h1><p className="muted" style={{ fontSize: 18, maxWidth: 720, margin: '18px auto 25px' }}>{page.description}</p><Link className="btn btn-primary" href={`/ar/ai-finder?q=${encodeURIComponent(page.query)}` as any}>اعثر على أفضل خيار لي <ArrowRight size={15} /></Link></section><section style={{ marginTop: 45 }}><div className="section-head"><div><div className="eyebrow">ترشيحات Eldevo</div><h2>ابدأ بالأدوات ثم اختر حسب احتياجاتك</h2></div><Link className="btn btn-secondary" href={"/ar/tools" as any}>تصفح كل الأدوات <ArrowRight size={15}/></Link></div><div className="tool-grid">{tools.map((tool: any) => <article className="card tool-card" key={tool.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{tool.logo_url ? <img src={tool.logo_url} alt={`${tool.name_ar || tool.name} logo`} width={48} height={48} loading="lazy" style={{ borderRadius: 12, objectFit: 'cover' }} /> : <div className="tool-logo">{(tool.name_ar || tool.name).slice(0, 1)}</div>}<h3 style={{ margin: 0 }}>{tool.name_ar || tool.name}</h3><p className="muted" style={{ margin: 0 }}>{tool.short_description_ar || tool.short_description}</p><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 13 }}><span>★ {tool.rating ?? '—'} ({tool.review_count ?? 0})</span>{tool.verified && <span className="badge"><CheckCircle2 size={12}/> موثّق</span>}<span>{tool.pricing_type || 'السعر يختلف'}</span></div><Link style={{ marginTop: 'auto' }} href={`/ar/tools/${tool.slug}` as any}>عرض المراجعة والتفاصيل <ArrowRight size={13}/></Link></article>)}</div></section><section className="card" style={{ padding: 26, marginTop: 34 }}><h2>اختر حسب احتياجك الحقيقي</h2><p className="muted">Eldevo لا يفترض أن أداة واحدة هي الأفضل للجميع. اكتب مهمتك وميزانيتك والميزات والمنصة المطلوبة، وسيقوم Finder بترتيب الخيارات المتاحة حسب متطلباتك.</p><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}><Link className="btn btn-secondary" href={`/ar/ai-finder?q=${encodeURIComponent(page.query)}` as any}>استخدم Finder</Link><Link className="btn btn-secondary" href={"/ar/compare" as any}>قارن الأدوات</Link></div></section><section style={{ marginTop: 34 }}><h2>الأسئلة الشائعة</h2>{faq.map((item) => <details className="card" style={{ padding: 18, marginTop: 10 }} key={item.q}><summary style={{ fontWeight: 700, cursor: 'pointer' }}>{item.q}</summary><p className="muted" style={{ marginBottom: 0 }}>{item.a}</p></details>)}</section></main>
}
