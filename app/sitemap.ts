import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'

const PAGE_SIZE = 45_000
const staticPaths = ['', '/ai-finder', '/tools', '/categories', '/compare', '/blog', '/about', '/contact', '/privacy', '/terms', '/submit-tool', '/affiliate-disclosure', '/best-ai-tools', '/best-ai-video-tools', '/best-free-ai-video-tools', '/best-ai-tools-for-youtube', '/best-ai-tools-for-tiktok', '/best-free-ai-tools', '/chatgpt-alternatives']

function localizedUrl(base: string, path: string, locale: 'en' | 'ar') {
  if (locale === 'en') return `${base}${path || '/'}`
  return `${base}/ar${path || '/'}`
}

function localizedEntry(base: string, path: string, lastModified: Date, priority: number, changeFrequency: 'weekly' | 'monthly' = 'weekly'): MetadataRoute.Sitemap[number] {
  const en = localizedUrl(base, path, 'en')
  const ar = localizedUrl(base, path, 'ar')
  return { url: en, lastModified, changeFrequency, priority, alternates: { languages: { en, ar } } }
}

function seoPath(slug: string) {
  return `/seo-pages/${slug}`
}

export async function generateSitemaps() {
  try {
    const db = await createClient()
    const { count } = await db.from('tools').select('*', { count: 'exact', head: true }).eq('status', 'published')
    return Array.from({ length: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)) }, (_, id) => ({ id }))
  } catch { return [{ id: 0 }] }
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const page = Number(await id)
  const base = getSiteUrl()
  const now = new Date()
  try {
    const db = await createClient()
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const [toolsResult, categoriesResult, articlesResult] = await Promise.all([
      db.from('tools').select('slug,updated_at').eq('status', 'published').order('updated_at', { ascending: false }).range(from, to),
      page === 0 ? db.from('categories').select('slug,updated_at').order('name') : Promise.resolve({ data: [] as { slug: string; updated_at: string | null }[] }),
      page === 0 ? db.from('articles').select('slug,updated_at,published_at').eq('status', 'published').order('published_at', { ascending: false }) : Promise.resolve({ data: [] as { slug: string; updated_at: string | null; published_at: string | null }[] }),
    ])
    const tools = toolsResult.data ?? []
    const categories = categoriesResult.data ?? []
    const articles = articlesResult.data ?? []
    const entries: MetadataRoute.Sitemap = []

    if (page === 0) {
      for (const path of staticPaths) entries.push(localizedEntry(base, path, now, path === '' ? 1 : 0.7))
      // SEO intent pages are defined centrally and share the same dynamic route.
      // Importing here keeps the sitemap aligned with the actual SEO page catalog.
      const { seoPages } = await import('./seo-pages')
      for (const seo of seoPages) entries.push(localizedEntry(base, seoPath(seo.slug), now, 0.75, 'weekly'))
    }
    for (const item of categories) entries.push(localizedEntry(base, `/categories/${item.slug}`, item.updated_at ? new Date(item.updated_at) : now, 0.7))
    for (const item of articles) entries.push(localizedEntry(base, `/blog/${item.slug}`, item.updated_at ? new Date(item.updated_at) : item.published_at ? new Date(item.published_at) : now, 0.6, 'monthly'))
    for (const item of tools) entries.push(localizedEntry(base, `/tools/${item.slug}`, item.updated_at ? new Date(item.updated_at) : now, 0.8))
    return entries
  } catch {
    return page === 0 ? staticPaths.map((path) => localizedEntry(base, path, now, path === '' ? 1 : 0.6)) : []
  }
}
