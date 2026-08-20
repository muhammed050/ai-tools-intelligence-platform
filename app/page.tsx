import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Code2, Image, Mic2, Search, Sparkles, Video } from 'lucide-react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { HomeFinder } from '@/components/home-finder'
import { HomeToolSection } from '@/components/home-tool-section'
import { LOCALE_COOKIE, normalizeLocale } from '@/lib/i18n'

export const metadata = { title: 'Eldevo — اكتشف أداة الذكاء الاصطناعي المناسبة', description: 'اكتشف وقارن أفضل أدوات الذكاء الاصطناعي واستخدم البحث الذكي للعثور على الأداة المناسبة لك.' }
export const dynamic = 'force-dynamic'

type Locale = 'en' | 'ar'
type Tool = { id: string; name: string; name_ar?: string | null; slug: string; short_description: string; short_description_ar?: string | null; rating: number | null; review_count: number; pricing_type: string | null; logo_url: string | null; verified: boolean; category: { name: string; name_ar?: string | null; slug: string } | { name: string; name_ar?: string | null; slug: string }[] | null }

const categorySeed = [
  { name: 'Writing & Content', name_ar: 'الكتابة والمحتوى', description: 'Write, edit and optimize content.', description_ar: 'اكتب المحتوى وحرره وحسّنه.', slug: 'writing', Icon: Search },
  { name: 'Coding & Development', name_ar: 'البرمجة والتطوير', description: 'Build with assistants, agents and IDEs.', description_ar: 'طوّر التطبيقات باستخدام المساعدين والوكلاء وبيئات البرمجة.', slug: 'coding', Icon: Code2 },
  { name: 'Image Generation', name_ar: 'توليد الصور', description: 'Create and edit visual assets.', description_ar: 'أنشئ الصور والتصاميم وعدّل المحتوى المرئي.', slug: 'image', Icon: Image },
  { name: 'Video & Animation', name_ar: 'الفيديو والرسوم المتحركة', description: 'Generate and enhance video content.', description_ar: 'أنشئ الفيديو وطوّره باستخدام الذكاء الاصطناعي.', slug: 'video', Icon: Video },
  { name: 'Voice & Audio', name_ar: 'الصوت والموسيقى', description: 'Create speech, music and voiceovers.', description_ar: 'أنشئ الأصوات والموسيقى والتعليق الصوتي.', slug: 'voice', Icon: Mic2 },
  { name: 'Business & Marketing', name_ar: 'الأعمال والتسويق', description: 'Improve growth, sales and operations.', description_ar: 'طوّر التسويق والمبيعات وسير العمل.', slug: 'marketing', Icon: BriefcaseBusiness },
]

export default async function Home() {
  const locale: Locale = normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value)
  const ar = locale === 'ar'
  let categories: any[] = []
  let featured: Tool[] = []
  let rated: Tool[] = []
  let recent: Tool[] = []
  let guides: any[] = []
  try {
    const db = await createClient()
    const select = 'id,name,name_ar,slug,short_description,short_description_ar,rating,review_count,pricing_type,logo_url,verified,category:categories(name,name_ar,slug)'
    const [categoryResult, featuredResult, ratedResult, recentResult, guideResult] = await Promise.all([
      db.from('categories').select('id,name,name_ar,slug,description,description_ar').order('name').limit(6),
      db.from('tools').select(select).eq('status', 'published').order('featured', { ascending: false }).order('rating', { ascending: false, nullsFirst: false }).limit(4),
      db.from('tools').select(select).eq('status', 'published').order('rating', { ascending: false, nullsFirst: false }).order('review_count', { ascending: false, nullsFirst: false }).limit(4),
      db.from('tools').select(select).eq('status', 'published').order('created_at', { ascending: false }).limit(4),
      ar ? Promise.resolve({ data: [] }) : db.from('articles').select('slug,title,excerpt').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
    ])
    categories = categoryResult.data || []
    featured = featuredResult.data || []
    rated = ratedResult.data || []
    recent = recentResult.data || []
    guides = guideResult.data || []
  } catch (error) { console.error('Homepage data unavailable', error) }

  const categoryCards = categorySeed.map((seed) => ({ ...seed, ...categories.find((category) => category.slug === seed.slug) })).map((category) => ({ ...category, displayName: ar ? (category.name_ar || category.name) : category.name, displayDescription: ar ? (category.description_ar || category.description) : (category.description || category.description_ar) })).filter((category) => category.displayName)

  return <main dir={ar ? 'rtl' : 'ltr'}>
    <section className="hero-glow">
      <div className="container" style={{ padding: '76px 0 68px', textAlign: 'center', position: 'relative' }}>
        <div className="eyebrow">{ar ? 'ذكاء أدوات الذكاء الاصطناعي' : 'AI Tools Intelligence'}</div>
        <h1 style={{ fontSize: 'clamp(44px,7vw,78px)', lineHeight: .98, letterSpacing: '-.055em', margin: '18px auto', maxWidth: 900 }}>
          {ar ? <>اكتشف أداة الذكاء الاصطناعي<br /><span style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1 55%,#7c3aed)', WebkitBackgroundClip: 'text', color: 'transparent' }}>المناسبة لأي مهمة.</span></> : <>Find the right AI tool<br /><span style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1 55%,#7c3aed)', WebkitBackgroundClip: 'text', color: 'transparent' }}>for any job.</span></>}
        </h1>
        <p className="muted" style={{ fontSize: 19, maxWidth: 700, margin: '0 auto' }}>{ar ? 'صف ما تريد إنجازه، وسنساعدك في العثور على أفضل الأدوات ومقارنتها بوضوح.' : 'Discover, compare and evaluate AI tools using structured data, reviews and intelligent recommendations.'}</p>
        <HomeFinder locale={locale} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
          <Link className="btn btn-primary" href="/ai-finder"><Sparkles size={17} /> {ar ? 'افتح مكتشف الأدوات' : 'Launch AI Finder'}</Link>
          <Link className="btn btn-secondary" href="/tools"><Search size={17} /> {ar ? 'تصفح الأدوات' : 'Browse AI tools'}</Link>
        </div>
      </div>
    </section>

    <section className="container" style={{ padding: '62px 0 20px' }}>
      <div className="section-head"><div><div className="eyebrow">{ar ? 'استكشف حسب احتياجك' : 'Explore by need'}</div><h2>{ar ? 'أشهر تصنيفات الذكاء الاصطناعي' : 'Popular AI categories'}</h2></div><Link className="btn btn-secondary" href="/categories">{ar ? 'عرض الكل' : 'View all'} <ArrowRight size={15} /></Link></div>
      <div className="tool-grid">{categoryCards.map(({ displayName, displayDescription, slug, Icon }) => <Link href={`/categories/${slug}`} className="card tool-card" key={slug}><div className="tool-logo"><Icon size={21} /></div><h3 style={{ margin: '18px 0 4px' }}>{displayName}</h3><p className="muted" style={{ margin: 0 }}>{displayDescription}</p><span style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--brand)', fontSize: 13 }}>{ar ? 'استكشف التصنيف' : 'Explore category'} <ArrowRight size={14} /></span></Link>)}</div>
    </section>

    <HomeToolSection locale={locale} eyebrow={ar ? 'اختيارات مميزة' : 'Featured directory'} title={ar ? 'أدوات ذكاء اصطناعي مميزة' : 'Featured AI tools'} tools={featured} />
    <HomeToolSection locale={locale} eyebrow={ar ? 'مؤشرات الجودة' : 'Quality signals'} title={ar ? 'الأدوات الأعلى تقييمًا' : 'Highly rated tools'} tools={rated} />
    <HomeToolSection locale={locale} eyebrow={ar ? 'إضافات جديدة' : 'Fresh listings'} title={ar ? 'أحدث الأدوات المضافة' : 'Recently added tools'} tools={recent} />

    {guides.length > 0 && <section className="container" style={{ padding: '54px 0 20px' }}><div className="section-head"><div><div className="eyebrow">Editorial desk</div><h2>Latest guides</h2></div><Link className="btn btn-secondary" href="/blog">Read all guides <ArrowRight size={15} /></Link></div><div className="tool-grid">{guides.map((guide) => <Link className="card tool-card" href={`/blog/${guide.slug}`} key={guide.slug}><div className="tool-logo"><Search size={20} /></div><div className="eyebrow" style={{ marginTop: 18 }}>AI Guide</div><h3 style={{ margin: '5px 0' }}>{guide.title}</h3><p className="muted" style={{ margin: 0 }}>{guide.excerpt}</p><span style={{ marginTop: 'auto', color: 'var(--brand)', fontSize: 13 }}>Read guide <ArrowRight size={14} /></span></Link>)}</div></section>}

    <section className="container" style={{ padding: '54px 0 80px' }}>
      <div className="card" style={{ padding: '36px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 30, alignItems: 'center', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)' }}>
        <div><div className="eyebrow">{ar ? 'اختر بثقة' : 'Choose with confidence'}</div><h2 style={{ fontSize: 34, letterSpacing: '-.04em', margin: '8px 0 12px' }}>{ar ? 'طريقة أبسط لبناء مجموعة أدوات الذكاء الاصطناعي الخاصة بك.' : 'A calmer way to build your AI stack.'}</h2><p className="muted">{ar ? 'استخدم مقارنات شفافة ومراجعات حقيقية وبيانات منظمة لاتخاذ قرار أفضل.' : 'Use transparent comparisons, real reviews and structured product data to make a better shortlist.'}</p><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link className="btn btn-primary" href="/compare">{ar ? 'قارن الأدوات' : 'Compare tools'} <ArrowRight size={15} /></Link><Link className="btn btn-secondary" href="/about">{ar ? 'منهجيتنا' : 'Our methodology'}</Link></div></div>
        <div style={{ display: 'grid', gap: 12 }}>{(ar ? [['يفهم نيتك', 'يفهم ما الذي تبحث عنه'], ['نتائج شفافة', 'اعرف لماذا تناسبك كل أداة'], ['اكتشاف أكثر أمانًا', 'البيانات غير المعروفة تبقى غير معروفة']] : [['Intent-aware', 'Understands what you mean'], ['Transparent matches', 'See why each tool fits'], ['Safer discovery', 'Unknown data stays unknown']]).map(([title, description]) => <div key={title} className="stat" style={{ display: 'flex', gap: 12 }}><CheckCircle2 size={20} color="var(--success)" /><div><strong>{title}</strong><div className="muted" style={{ fontSize: 13 }}>{description}</div></div></div>)}</div>
      </div>
    </section>
  </main>
}
