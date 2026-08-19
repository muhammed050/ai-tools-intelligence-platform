import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Best Free AI Video Tools', description: 'Explore published AI video tools with a verified free option in the directory data.', alternates: { canonical: '/best-free-ai-video-tools' } }

export default async function BestFreeVideoTools() {
  try {
    const db = await createClient()
    const { data: category } = await db.from('categories').select('id').eq('slug', 'video').maybeSingle()
    const { data } = category ? await db.from('tools').select('name,slug,short_description,rating,pricing_type,review_count,pricing_plans(is_free)').eq('status', 'published').eq('category_id', category.id).limit(60) : { data: [] }
    const free = (data || []).filter((tool: any) => tool.pricing_type === 'free' || tool.pricing_plans?.some((plan: any) => plan.is_free)).sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
    return <main className="container" style={{ padding: '55px 0 100px' }}><h1>Best free AI video tools</h1><p className="muted">Only tools with a database record indicating a free option are shown.</p><div style={{ display: 'grid', gap: 14, marginTop: 24 }}>{free.length ? free.map((tool: any, index: number) => <Link className="card" style={{ padding: 22 }} href={`/tools/${tool.slug}`} key={tool.slug}><strong>#{index + 1} {tool.name}</strong><p className="muted">{tool.short_description}</p><span>★ {tool.rating ?? 'No rating'} · {tool.pricing_type || 'Pricing unknown'}{tool.review_count ? ` · ${tool.review_count} reviews` : ''}</span></Link>) : <div className="card directory-empty"><h2>No free video tools are currently published</h2><p className="muted">Only verified free-plan data appears on this page.</p></div>}</div></main>
  } catch (error) {
    console.error('Free video landing data unavailable', error)
    return <main className="container" style={{ padding: '55px 0 100px' }}><h1>Best free AI video tools</h1><div className="card directory-empty"><h2>Directory data is temporarily unavailable</h2><p className="muted">Please try again later.</p></div></main>
  }
}
