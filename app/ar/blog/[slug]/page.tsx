import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'

async function getPost(slug: string) {
  const db = await createClient()
  const { data: article } = await db.from('articles').select('id,title,slug,excerpt,content,updated_at,published_at,seo_title,seo_description').eq('slug', slug).eq('status', 'published').maybeSingle()
  if (!article) return null
  const { data: translation } = await db.from('article_translations').select('title,excerpt,content,seo_title,seo_description').eq('article_id', article.id).eq('locale', 'ar').maybeSingle()
  return { article, translation }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const result = await getPost((await params).slug)
  if (!result) return { robots: { index: false, follow: true } }
  const { article, translation } = result
  const site = getSiteUrl(); const en = `${site}/blog/${article.slug}`; const ar = `${site}/ar/blog/${article.slug}`
  if (!translation?.title || !translation.content) return { alternates: { canonical: en, languages: { en, 'x-default': en } }, robots: { index: false, follow: true } }
  const title = translation.seo_title || translation.title
  const description = translation.seo_description || translation.excerpt || ''
  return { title, description, alternates: { canonical: ar, languages: { ar, en, 'x-default': en } }, openGraph: { type: 'article', title, description, url: ar, locale: 'ar_SA', alternateLocale: ['en_US'] }, twitter: { card: 'summary_large_image', title, description }, robots: { index: true, follow: true } }
}

export default async function ArabicBlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const result = await getPost((await params).slug); if (!result) notFound(); const { article, translation } = result
  if (!translation?.title || !translation.content) notFound()
  const title = translation.title; const description = translation.excerpt || ''; const content = translation.content; const site = getSiteUrl()
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description, dateModified: article.updated_at || article.published_at, mainEntityOfPage: `${site}/ar/blog/${article.slug}`, inLanguage: 'ar' }
  return <main className="container" dir="rtl" style={{ padding: '58px 0 90px' }}><article style={{ maxWidth: 780, margin: '0 auto' }}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><nav className="muted" aria-label="مسار التنقل"><Link href={"/ar/blog" as any}>الأدلة</Link> / دليل</nav><div className="eyebrow" style={{ marginTop: 24 }}>دليل الذكاء الاصطناعي</div><h1 style={{ fontSize: 50, letterSpacing: '-.045em', lineHeight: 1.05, margin: '8px 0 16px' }}>{title}</h1><p className="muted" style={{ fontSize: 19 }}>{description}</p><div className="card" style={{ padding: '26px 30px', marginTop: 34 }}>{content.split(/\n\s*\n/).map((paragraph: string) => <p key={paragraph} style={{ fontSize: 18, lineHeight: 1.8 }}>{paragraph}</p>)}<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link className="btn btn-primary" href={"/ar/ai-finder" as any}>اعثر على أدوات تناسب سير عملك</Link><Link className="btn btn-secondary" href={"/ar/tools" as any}>تصفح الدليل</Link></div></div></article></main>
}
