import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Best AI Video Tools', description: 'Compare published AI video tools using current directory data, pricing and quality signals.', alternates: { canonical: '/best-ai-video-tools' } }

export default async function BestVideoTools() {
  try {
    const db = await createClient()
    const { data: category } = await db.from('categories').select('id').eq('slug', 'video').maybeSingle()
    const { data } = category ? await db.from('tools').select('name,slug,short_description,rating,pricing_type,review_count').eq('status', 'published').eq('category_id', category.id).order('rating', { ascending: false, nullsFirst: false }).limit(30) : { data: [] }
    const tools = data || []
    return <main className="container" style={{ padding: '55px 0 100px' }}><h1>Best AI video tools</h1><p className="muted">A database-backed shortlist of published AI video tools, ranked using current directory quality signals.</p><div style={{ display: 'grid', gap: 14, marginTop: 24 }}>{tools.length ? tools.map((tool: any, index) => <Link className="card" style={{ padding: 22 }} href={`/tools/${tool.slug}`} key={tool.slug}><strong>#{index + 1} {tool.name}</strong><p className="muted">{tool.short_description}</p><span>★ {tool.rating ?? 'No rating'} · {tool.pricing_type || 'Pricing unknown'}{tool.review_count ? ` · ${tool.review_count} reviews` : ''}</span></Link>) : <div className="card directory-empty"><h2>No published video tools yet</h2><p className="muted">The shortlist will appear when verified directory data is available.</p></div>}</div></main>
  } catch (error) {
    console.error('Video landing data unavailable', error)
    return <main className="container" style={{ padding: '55px 0 100px' }}><h1>Best AI video tools</h1><div className="card directory-empty"><h2>Directory data is temporarily unavailable</h2><p className="muted">Please try again later.</p></div></main>
  }
}
