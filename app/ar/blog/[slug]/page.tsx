import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'
import BlogPost from '@/app/blog/[slug]/page'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const db = await createClient()
  const { data: article } = await db.from('articles').select('title,slug,excerpt,seo_title,seo_description').eq('slug', slug).eq('status', 'published').maybeSingle()
  if (!article) return { robots: { index: false, follow: true } }
  const site = getSiteUrl(); const en = `${site}/blog/${article.slug}`; const ar = `${site}/ar/blog/${article.slug}`
  const title = article.seo_title || article.title
  const description = article.seo_description || article.excerpt || ''
  return { title, description, alternates: { canonical: ar, languages: { ar, en, 'x-default': en } }, openGraph: { type: 'article', title, description, url: ar, locale: 'ar_SA', alternateLocale: ['en_US'] }, robots: { index: true, follow: true } }
}

export default async function ArabicBlogPost({ params }: { params: Promise<{ slug: string }> }) { return <BlogPost params={params} /> }
