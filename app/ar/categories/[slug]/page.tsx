import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'
import CategoryPage from '@/app/categories/[slug]/page'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const db = await createClient()
  const { data: category } = await db.from('categories').select('name,name_ar,slug,description,seo_title,seo_description').eq('slug', slug).maybeSingle()
  if (!category) return { robots: { index: false, follow: true } }
  const site = getSiteUrl(); const en = `${site}/categories/${category.slug}`; const ar = `${site}/ar/categories/${category.slug}`
  const title = category.seo_title || `${category.name_ar || category.name} — أدوات الذكاء الاصطناعي`
  const description = category.seo_description || category.description
  return { title, description, alternates: { canonical: ar, languages: { ar, en, 'x-default': en } }, openGraph: { type: 'website', title, description, url: ar, locale: 'ar_SA', alternateLocale: ['en_US'] }, robots: { index: true, follow: true } }
}

export default async function ArabicCategoryPage({ params }: { params: Promise<{ slug: string }> }) { return <CategoryPage params={params} /> }
