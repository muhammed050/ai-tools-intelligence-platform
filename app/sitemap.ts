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
  '/best-ai-video-tools',
  '/best-free-ai-video-tools',
]

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

    return [
      ...staticPaths.map((path) => ({
        url: `${base}${path}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: path === '' ? 1 : 0.7,
      })),
      ...categories.map((item) => ({
        url: `${base}/categories/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...articles.map((item) => ({
        url: `${base}/blog/${item.slug}`,
        lastModified: item.updated_at
          ? new Date(item.updated_at)
          : item.published_at
            ? new Date(item.published_at)
            : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
      ...tools.map((item) => ({
        url: `${base}/tools/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ].slice(0, MAX_URLS)
  } catch {
    return staticPaths.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.6,
    }))
  }
}
