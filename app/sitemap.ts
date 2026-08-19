import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const fallbackArticles = ['how-to-choose-the-right-ai-tool', 'best-ai-tools-for-content-creation', 'ai-tool-stack-for-developers']
const staticPaths = ['', '/ai-finder', '/tools', '/categories', '/compare', '/blog', '/about', '/contact', '/privacy', '/terms', '/submit-tool', '/best-ai-video-tools', '/best-free-ai-video-tools']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tools-intelligence-platform-iota.vercel.app'
  const now = new Date()
  try {
    const db = await createClient()
    const [toolsResult, categoriesResult, articlesResult, collectionsResult] = await Promise.all([
      db.from('tools').select('slug,updated_at').eq('status', 'published').order('featured', { ascending: false }).order('rating', { ascending: false, nullsFirst: false }),
      db.from('categories').select('slug,updated_at').order('name'),
      db.from('articles').select('slug,updated_at,published_at').eq('status', 'published').order('published_at', { ascending: false }),
      db.from('collections').select('slug,updated_at').eq('status', 'published').limit(100),
    ])
    const tools = toolsResult.data || []
    const categories = categoriesResult.data || []
    const articles = articlesResult.data?.length ? articlesResult.data : fallbackArticles.map((slug) => ({ slug, updated_at: null, published_at: null }))
    const comparisons = tools.slice(0, 20).flatMap((first, index) => tools.slice(index + 1, 20).map((second) => ({ url: `${base}/compare/${[first.slug, second.slug].sort().join('-vs-')}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 })))
    return [
      ...staticPaths.map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: 'weekly' as const, priority: path === '' ? 1 : 0.7 })),
      ...categories.map((category) => ({ url: `${base}/categories/${category.slug}`, lastModified: category.updated_at ? new Date(category.updated_at) : now, changeFrequency: 'weekly' as const, priority: 0.7 })),
      ...articles.map((article) => ({ url: `${base}/blog/${article.slug}`, lastModified: article.updated_at ? new Date(article.updated_at) : article.published_at ? new Date(article.published_at) : now, changeFrequency: 'monthly' as const, priority: 0.6 })),
      ...tools.map((tool) => ({ url: `${base}/tools/${tool.slug}`, lastModified: tool.updated_at ? new Date(tool.updated_at) : now, changeFrequency: 'weekly' as const, priority: 0.8 })),
      ...comparisons,
      ...(collectionsResult.data || []).map((collection) => ({ url: `${base}/collections/${collection.slug}`, lastModified: collection.updated_at ? new Date(collection.updated_at) : now, changeFrequency: 'monthly' as const, priority: 0.4 })),
    ]
  } catch {
    return staticPaths.map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: 'weekly' as const, priority: path === '' ? 1 : 0.6 }))
  }
}
