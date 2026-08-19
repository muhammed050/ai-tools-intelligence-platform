import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const querySchema = z.string().trim().min(2).max(80)

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('q') || ''
  const parsed = querySchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ tools: [], categories: [], articles: [] })
  const query = parsed.data
  try {
    const db = await createClient()
    const [tools, categories, articles] = await Promise.all([
      db.from('tools').select('name,slug,short_description').eq('status', 'published').or(`name.ilike.%${query}%,short_description.ilike.%${query}%`).limit(5),
      db.from('categories').select('name,slug,description').or(`name.ilike.%${query}%,description.ilike.%${query}%`).limit(4),
      db.from('articles').select('title,slug,excerpt').eq('status', 'published').or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`).limit(4),
    ])
    return NextResponse.json({ tools: tools.data || [], categories: categories.data || [], articles: articles.data || [] }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch (error) {
    console.error('Global search failed', error)
    return NextResponse.json({ error: 'Search temporarily unavailable', tools: [], categories: [], articles: [] }, { status: 503 })
  }
}
