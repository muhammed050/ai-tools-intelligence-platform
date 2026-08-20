import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPost } from '@/lib/content/articles'
import { getSiteUrl } from '@/lib/site'

export default async function ArabicBlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const result = await getPost((await params).slug); if (!result) notFound(); const { article, translation } = result
  if (!translation?.title || !translation.content) notFound()
  const title = translation.title; const description = translation.excerpt || ''; const content = translation.content; const site = getSiteUrl()
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description, dateModified: article.updated_at || article.published_at, mainEntityOfPage: `${site}/ar/blog/${article.slug}`, inLanguage: 'ar' }
  return <main className="container" dir="rtl" style={{ padding: '58px 0 90px' }}><article style={{ maxWidth: 780, margin: '0 auto' }}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><nav className="muted" aria-label="مسار التنقل"><Link href={"/ar/blog" as any}>الأدلة</Link> / دليل</nav><div className="eyebrow" style={{ marginTop: 24 }}>دليل الذكاء الاصطناعي</div><h1 style={{ fontSize: 50, letterSpacing: '-.045em', lineHeight: 1.05, margin: '8px 0 16px' }}>{title}</h1><p className="muted" style={{ fontSize: 19 }}>{description}</p><div className="card" style={{ padding: '26px 30px', marginTop: 34 }}>{content.split(/\n\s*\n/).map((paragraph: string) => <p key={paragraph} style={{ fontSize: 18, lineHeight: 1.8 }}>{paragraph}</p>)}<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link className="btn btn-primary" href={"/ar/ai-finder" as any}>اعثر على أدوات تناسب سير عملك</Link><Link className="btn btn-secondary" href={"/ar/tools" as any}>تصفح الدليل</Link></div></div></article></main>
}
