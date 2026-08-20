import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'
import ToolPage from '@/app/tools/[slug]/page'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const db = await createClient()
  const { data: tool } = await db.from('tools').select('id,name,name_ar,slug,short_description,short_description_ar,description,description_ar,logo_url').eq('slug', slug).eq('status', 'published').maybeSingle()
  if (!tool) return { robots: { index: false, follow: true } }

  const { data: translation } = await db.from('tool_translations').select('name,short_description,description,seo_title,seo_description').eq('tool_id', tool.id).eq('locale', 'ar').maybeSingle()
  const site = getSiteUrl()
  const en = `${site}/tools/${tool.slug}`
  const ar = `${site}/ar/tools/${tool.slug}`
  const name = translation?.name || tool.name_ar || tool.name
  const description = translation?.short_description || tool.short_description_ar || tool.short_description || translation?.description || tool.description_ar || tool.description
  const title = translation?.seo_title || `${name} — مراجعة وأسعار وأفضل البدائل`

  return {
    title,
    description,
    alternates: { canonical: ar, languages: { ar, en, 'x-default': en } },
    openGraph: { type: 'article', title, description, url: ar, locale: 'ar_SA', alternateLocale: ['en_US'], images: tool.logo_url ? [tool.logo_url] : [] },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  }
}

export default async function ArabicToolPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ToolPage params={params} />
}
