import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'

const MAX_URLS = 45_000
const staticPaths = [
  '',
  '/ai-finder',
  '/tools',
  '/categories',
  '/compare',
  '/blog',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/submit-tool',
  '/affiliate-disclosure',
  '/best-ai-tools',
  '/best-ai-video-tools',
  '/best-free-ai-video-tools',
  '/best-ai-tools-for-youtube',
  '/best-ai-tools-for-tiktok',
  '/best-free-ai-tools',
  '/chatgpt-alternatives',
]

function localizedUrl(base: string, path: string, locale: 'en' | 'ar') {
  if (locale === 'en') return `${base}${path || '/'}`
  return `${base}/ar${path || '/'}`
}

function localizedEntry(
  base: string,
  path: string,
  lastModified: Date,
  priority: number,
  changeFrequency: 'weekly' | 'monthly' = 'weekly',
): MetadataRoute.Sitemap[number] {
  const en = localizedUrl(base, path, 'en')
  const ar = localizedUrl(base, path, 'ar')
  return {
    url: en,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: { en, ar } },
  }
}

function seoPath(slug: string) {
  return `/seo-pages/${slug}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const now = new Date()

  try {
    const db = await createClient()
    const [toolsResult, categoriesResult, articlesResult] = await Promise.all([
      db
        .from('tools')
        .select('slug,updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .range(0, MAX_URLS - 1),
      db.from('categories').select('slug,updated_at').order('name').range(0, 5000),
      db
        .from('articles')
        .select('slug,updated_at,published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(0, 5000),
    ])

    const tools = toolsResult.data ?? []
    const categories = categoriesResult.data ?? []
    const articles = articlesResult.data ?? []
    const entries: MetadataRoute.Sitemap = []

    for (const path of staticPaths) {
      entries.push(localizedEntry(base, path, now, path === '' ? 1 : 0.7))
    }

    try {
      const { seoPages } = await import('./seo-pages')
      for (const seo of seoPages) {
        entries.push(localizedEntry(base, seoPath(seo.slug), now, 0.75, 'weekly'))
      }
    } catch {
      // Keep the main sitemap available if the optional SEO catalog is unavailable.
    }

    for (const item of categories) {
      entries.push(localizedEntry(base, `/categories/${item.slug}`, item.updated_at ? new Date(item.updated_at) : now, 0.7))
    }
    for (const item of articles) {
      entries.push(
        localizedEntry(
          base,
          `/blog/${item.slug}`,
          item.updated_at ? new Date(item.updated_at) : item.published_at ? new Date(item.published_at) : now,
          0.6,
          'monthly',
        ),
      )
    }
    for (const item of tools) {
      entries.push(localizedEntry(base, `/tools/${item.slug}`, item.updated_at ? new Date(item.updated_at) : now, 0.8))
    }

    return entries.slice(0, MAX_URLS)
  } catch {
    return staticPaths.map((path) => localizedEntry(base, path, now, path === '' ? 1 : 0.6))
  }
}
