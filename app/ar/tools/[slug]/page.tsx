import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'
import ToolPage from '@/app/tools/[slug]/page'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const db = await createClient()
  const { data: tool } = await db.from('tools').select('name,name_ar,slug,short_description,short_description_ar,description,description_ar,seo_title,seo_description,logo_url').eq('slug', slug).eq('status', 'published').maybeSingle()
  if (!tool) return { robots: { index: false, follow: true } }
  const site = getSiteUrl(); const en = `${site}/tools/${tool.slug}`; const ar = `${site}/ar/tools/${tool.slug}`
  const title = tool.seo_title || `${tool.name_ar || tool.name} — مراجعة وأسعار وأفضل البدائل`
  const description = tool.seo_description || tool.short_description_ar || tool.description_ar || tool.short_description || tool.description
  return { title, description, alternates: { canonical: ar, languages: { ar, en, 'x-default': en } }, openGraph: { type: 'article', title, description, url: ar, locale: 'ar_SA', alternateLocale: ['en_US'], images: tool.logo_url ? [tool.logo_url] : [] }, twitter: { card: 'summary_large_image', title, description }, robots: { index: true, follow: true } }
}

export default async function ArabicToolPage({ params }: { params: Promise<{ slug: string }> }) { return <ToolPage params={params} /> }
