import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, Code2, Image, Mic2, Search, Sparkles, Video } from 'lucide-react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { HomeFinder } from '@/components/home-finder'
import { HomeToolSection } from '@/components/home-tool-section'
import { LOCALE_COOKIE, normalizeLocale } from '@/lib/i18n'
import styles from './home.module.css'

export const metadata = { title: 'Eldevo — AI Tools Intelligence', description: 'Discover, compare and choose the right AI tool for any task.' }
export const dynamic = 'force-dynamic'

type Locale = 'en' | 'ar'
type Tool = { id: string; name: string; name_ar?: string | null; slug: string; short_description: string; short_description_ar?: string | null; rating: number | null; review_count: number; pricing_type: string | null; logo_url: string | null; verified: boolean; category: { name: string; name_ar?: string | null; slug: string } | { name: string; name_ar?: string | null; slug: string }[] | null }

const categorySeed = [
  { name: 'Writing & Content', name_ar: 'الكتابة والمحتوى', description: 'Write, edit and optimize content.', description_ar: 'اكتب المحتوى وحرره وحسّنه.', slug: 'writing', Icon: Search },
  { name: 'Coding & Development', name_ar: 'البرمجة والتطوير', description: 'Build with assistants, agents and IDEs.', description_ar: 'طوّر التطبيقات باستخدام المساعدين والوكلاء.', slug: 'coding', Icon: Code2 },
  { name: 'Image Generation', name_ar: 'توليد الصور', description: 'Create and edit visual assets.', description_ar: 'أنشئ الصور والتصاميم وعدّل المحتوى المرئي.', slug: 'image', Icon: Image },
  { name: 'Video & Animation', name_ar: 'الفيديو والرسوم', description: 'Generate and enhance video.', description_ar: 'أنشئ الفيديو وطوّره بالذكاء الاصطناعي.', slug: 'video', Icon: Video },
  { name: 'Voice & Audio', name_ar: 'الصوت والموسيقى', description: 'Create speech, music and voiceovers.', description_ar: 'أنشئ الأصوات والموسيقى والتعليق الصوتي.', slug: 'voice', Icon: Mic2 },
  { name: 'Business & Marketing', name_ar: 'الأعمال والتسويق', description: 'Improve growth, sales and operations.', description_ar: 'طوّر التسويق والمبيعات وسير العمل.', slug: 'marketing', Icon: BriefcaseBusiness },
]

const intentSeeds = [
  { slug: 'ai-tools-for-youtube', en: 'AI tools for YouTube', ar: 'أدوات AI لليوتيوب', query: 'I need an AI tool for YouTube' },
  { slug: 'ai-tools-for-tiktok', en: 'AI tools for TikTok', ar: 'أدوات AI لتيك توك', query: 'I need an AI tool for TikTok' },
  { slug: 'free-ai-video-tools', en: 'Free AI video tools', ar: 'أدوات فيديو AI مجانية', query: 'I need a free AI video tool' },
  { slug: 'chatgpt-alternatives', en: 'ChatGPT alternatives', ar: 'بدائل ChatGPT', query: 'I need an alternative to ChatGPT' },
  { slug: 'ai-tools-for-students', en: 'AI tools for students', ar: 'أدوات AI للطلاب', query: 'I need AI tools for studying' },
  { slug: 'ai-tools-for-content-creators', en: 'AI tools for creators', ar: 'أدوات AI لصناع المحتوى', query: 'I need AI tools for content creation' },
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

  return <main className={styles.page} dir={ar ? 'rtl' : 'ltr'}>
    <section className={styles.hero}>
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.kicker}><Sparkles size={14} /> {ar ? 'دليل الذكاء الاصطناعي' : 'AI TOOL INTELLIGENCE'}</div>
        <h1 className={styles.heroTitle}>{ar ? 'اكتشف الأداة المناسبة' : 'Find the right AI tool'}<br /><span>{ar ? 'لأي مهمة.' : 'for any job.'}</span></h1>
        <p className={styles.heroLead}>{ar ? 'لا تبحث بين آلاف الأدوات. اكتب ما تريد إنجازه، ثم قارن الخيارات المناسبة في مكان واحد.' : 'Stop browsing endless lists. Tell us what you want to accomplish, then compare the tools that actually fit.'}</p>
        <div className={styles.finderWrap}><HomeFinder locale={locale} /></div>
        <div className={styles.heroActions}>
          <Link className="btn btn-primary" href="/ai-finder"><Sparkles size={17} /> {ar ? 'ابدأ بالمكتشف' : 'Start with AI Finder'}</Link>
          <Link className="btn btn-secondary" href="/tools"><Search size={17} /> {ar ? 'استكشف الدليل' : 'Explore directory'}</Link>
        </div>
      </div>
    </section>

    <section className={`container ${styles.section}`} aria-labelledby="intent-heading">
      <div className={styles.sectionHead}><div><div className={styles.sectionKicker}>{ar ? 'ابدأ من النتيجة' : 'START WITH THE OUTCOME'}</div><h2 id="intent-heading" className={styles.sectionTitle}>{ar ? 'ماذا تريد أن تنجز؟' : 'What are you trying to do?'}</h2><p className={styles.sectionCopy}>{ar ? 'مسارات جاهزة لأكثر المهام التي يبحث عنها الناس.' : 'Jump directly into common tasks instead of learning another tool catalog.'}</p></div><Link className="btn btn-secondary" href="/ai-finder">{ar ? 'المكتشف' : 'Open Finder'} <ArrowRight size={15} /></Link></div>
      <div className={styles.intentGrid}>{intentSeeds.map((item) => <Link key={item.slug} href={`/ai-finder?q=${encodeURIComponent(item.query)}`} className={styles.intent}><div className={styles.intentIcon}><Sparkles size={19} /></div><h3>{ar ? item.ar : item.en}</h3><p>{ar ? 'دع Eldevo يختصر لك الطريق إلى الأدوات المناسبة.' : 'Let Eldevo shortlist the tools that match the job.'}</p><span className={styles.intentArrow}>{ar ? 'ابحث الآن' : 'Find matching tools'} <ArrowRight size={13} /></span></Link>)}</div>
    </section>

    <section className={`container ${styles.section}`} aria-labelledby="category-heading">
      <div className={styles.sectionHead}><div><div className={styles.sectionKicker}>{ar ? 'مجالات الذكاء الاصطناعي' : 'THE AI LANDSCAPE'}</div><h2 id="category-heading" className={styles.sectionTitle}>{ar ? 'استكشف حسب المجال' : 'Explore by category'}</h2></div><Link className="btn btn-secondary" href="/categories">{ar ? 'كل التصنيفات' : 'All categories'} <ArrowRight size={15} /></Link></div>
      <div className={styles.categoryGrid}>{categoryCards.map(({ displayName, slug, Icon }) => <Link href={`/categories/${slug}`} className={styles.category} key={slug}><div className={styles.categoryIcon}><Icon size={18} /></div><div className={styles.categoryName}>{displayName}</div></Link>)}</div>
    </section>

    <section className={`container ${styles.section}`} aria-label={ar ? 'عمليات بحث شائعة' : 'Popular searches'}>
      <div className={styles.sectionKicker}>{ar ? 'نية بحث حقيقية' : 'REAL SEARCH INTENT'}</div><h2 className={styles.sectionTitle}>{ar ? 'ابدأ من سؤال واضح' : 'Start with a question'}</h2>
      <p className={styles.sectionCopy}>{ar ? 'صفحات مخصصة لاحتياجات محددة تساعد الزائر من البحث إلى القرار بسرعة.' : 'Focused landing pages connect specific search intent with a useful shortlist.'}</p>
      <div className={styles.searchCloud} style={{ marginTop: 22 }}>{intentSeeds.map((item) => <Link key={item.slug} className={styles.searchChip} href={`/seo-pages/${item.slug}`}>{ar ? item.ar : item.en}</Link>)}</div>
    </section>

    <section className={`container ${styles.section}`}>
      <div className={styles.confidence}>
        <div><div className={styles.sectionKicker}>{ar ? 'قرار أسرع، ضجيج أقل' : 'LESS NOISE. BETTER DECISIONS.'}</div><h2>{ar ? 'لا نعرض لك الأدوات فقط. نساعدك على اختيارها.' : 'Don’t just browse AI tools. Choose the right one.'}</h2><p>{ar ? 'Eldevo يجمع الاكتشاف والمقارنة والبحث حسب المهمة في تجربة واحدة، حتى تصل إلى الأداة المناسبة بأقل وقت.' : 'Eldevo brings discovery, comparison and task-based search into one focused experience, so you can reach the right tool faster.'}</p></div>
        <div className={styles.confidenceStats}><div className={styles.stat}><strong>6</strong><span>{ar ? 'مجالات رئيسية' : 'Core categories'}</span></div><div className={styles.stat}><strong>AI</strong><span>{ar ? 'اكتشاف حسب المهمة' : 'Task-first discovery'}</span></div><div className={styles.stat}><strong>24/7</strong><span>{ar ? 'دليل مفتوح' : 'Open directory'}</span></div><div className={styles.stat}><strong>1</strong><span>{ar ? 'مكان لاتخاذ القرار' : 'Place to decide'}</span></div></div>
      </div>
    </section>

    <section className={`container ${styles.section}`} aria-labelledby="featured-heading"><HomeToolSection id="featured-heading" title={ar ? 'أدوات مميزة' : 'Featured tools'} tools={featured} locale={locale} /></section>
    <section className={`container ${styles.section}`} aria-labelledby="rated-heading"><HomeToolSection id="rated-heading" title={ar ? 'الأعلى تقييمًا' : 'Top rated'} tools={rated} locale={locale} /></section>
    <section className={`container ${styles.section}`} aria-labelledby="recent-heading"><HomeToolSection id="recent-heading" title={ar ? 'أضيفت حديثًا' : 'Recently added'} tools={recent} locale={locale} /></section>
    {guides.length > 0 && <section className={`container ${styles.section}`} aria-labelledby="guides-heading"><div className={styles.sectionHead}><div><div className={styles.sectionKicker}>GUIDES</div><h2 id="guides-heading" className={styles.sectionTitle}>{ar ? 'دليل الاستخدام' : 'AI guides'}</h2></div></div><div className={styles.searchCloud}>{guides.map((guide) => <Link key={guide.slug} className={styles.searchChip} href={`/guides/${guide.slug}`}>{guide.title}</Link>)}</div></section>}
    <div className={styles.footerSpace} />
  </main>
}
