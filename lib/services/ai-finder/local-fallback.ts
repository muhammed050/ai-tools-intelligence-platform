import type { SearchIntent } from './intent'

type Tool = {
  id: string
  name: string
  slug: string
  description?: string | null
  short_description?: string | null
  website_url?: string | null
  rating?: number | null
  quality_score?: number | null
  pricing_type?: string | null
  starting_price?: number | null
  use_cases?: string[] | null
  platforms?: string[] | null
}

const KEYWORDS: Record<string, string[]> = {
  video: ['video', 'tiktok', 'reels', 'youtube', 'clip', 'animation', 'فيديو', 'تيك توك'],
  image: ['image', 'photo', 'product photo', 'thumbnail', 'صورة', 'صور', 'منتج'],
  voice: ['voice', 'speech', 'tts', 'clone', 'dubbing', 'صوت', 'استنساخ'],
  writing: ['write', 'article', 'seo', 'copy', 'blog', 'writing', 'كتابة', 'مقال', 'سيو'],
  coding: ['code', 'coding', 'developer', 'programming', 'website', 'app', 'برمجة', 'موقع'],
  research: ['research', 'search', 'sources', 'fact', 'بحث', 'مصادر'],
  marketing: ['marketing', 'ads', 'sales', 'brand', 'تسويق', 'إعلانات'],
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ')
}

export function buildFallbackIntent(query: string): SearchIntent {
  const text = normalize(query)
  const categories = Object.entries(KEYWORDS)
    .filter(([, words]) => words.some((word) => text.includes(normalize(word))))
    .map(([category]) => category)

  return {
    query,
    categories: categories.slice(0, 3),
    use_cases: [],
    pricing: 'any',
    platforms: [],
    budget_max: null,
    requirements: [],
  }
}

export function rankToolsLocally(tools: Tool[], query: string, intent?: SearchIntent) {
  const text = normalize(query)
  const categories = intent?.categories ?? []

  return tools
    .map((tool) => {
      const haystack = normalize([
        tool.name,
        tool.description,
        tool.short_description,
        ...(tool.use_cases ?? []),
        ...(tool.platforms ?? []),
      ].filter(Boolean).join(' '))

      let score = 0
      const words = text.split(/\s+/).filter((word) => word.length > 2)
      for (const word of words) if (haystack.includes(word)) score += 8
      for (const category of categories) {
        if ((tool.use_cases ?? []).some((x) => normalize(x).includes(normalize(category)))) score += 20
        if (haystack.includes(normalize(category))) score += 10
      }

      score += Math.min(10, Number(tool.rating ?? 0) * 2)
      score += Math.min(10, Number(tool.quality_score ?? 0) / 10)

      return { ...tool, match_score: Math.min(99, Math.round(score)) }
    })
    .sort((a, b) => b.match_score - a.match_score)
}
