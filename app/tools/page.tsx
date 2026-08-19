import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Search, Sparkles } from 'lucide-react'

export const metadata = { title: 'AI Tools Directory', description: 'Browse and compare curated AI tools for writing, coding, image, video, voice, research and business.' }

type SearchParams = { q?: string; category?: string; pricing?: string; sort?: string }

export default async function Tools({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const queryText = params.q?.trim() || ''
  let data: any[] = []
  try {
    const db = await createClient()
    let query = db.from('tools').select('id,name,slug,short_description,rating,review_count,pricing_type,logo_url,verified,featured,category:categories!inner(name,slug)').eq('status', 'published').order('featured', { ascending: false })
    if (queryText) query = query.or(`name.ilike.%${queryText}%,short_description.ilike.%${queryText}%`)
    if (params.category) query = query.eq('categories.slug', params.category)
    if (params.pricing) query = query.eq('pricing_type', params.pricing)
    query = params.sort === 'newest' ? query.order('created_at', { ascending: false }) : query.order('rating', { ascending: false, nullsFirst: false })
    const result = await query.limit(60)
    data = result.data || []
  } catch (error) {
    console.error('Directory unavailable', error)
  }

  return <main className="container" style={{ padding: '58px 0 90px' }}><div className="section-head"><div><div className="eyebrow">Curated directory</div><h1 style={{ fontSize: 46, letterSpacing: '-.04em', margin: '6px 0' }}>AI Tools</h1><p className="muted">Discover useful AI software, sorted by relevance and quality.</p></div><Link className="btn btn-primary" href="/ai-finder"><Sparkles size={16} /> Ask AI Finder</Link></div><form className="card" style={{ padding: 10, display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}><Search size={19} style={{ margin: '12px 0 0 8px', color: '#93a4bb' }} /><input name="q" defaultValue={queryText} placeholder="Search by tool name or use case" aria-label="Search AI tools" /><select name="pricing" defaultValue={params.pricing || ''} aria-label="Filter by pricing"><option value="">All pricing</option><option value="free">Free</option><option value="freemium">Freemium</option><option value="paid">Paid</option></select><select name="sort" defaultValue={params.sort || ''} aria-label="Sort tools"><option value="">Highest rated</option><option value="newest">Newest</option></select><button className="btn btn-primary">Apply filters</button></form>{!data?.length ? <div className="card" style={{ padding: 28, textAlign: 'center' }}><h2>No matching tools</h2><p className="muted">Try a broader search or use AI Finder to describe your goal.</p></div> : <div className="tool-grid">{data.map((tool: any) => <Link className="card tool-card" href={`/tools/${tool.slug}`} key={tool.id}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div className="tool-logo">{tool.logo_url ? <img src={tool.logo_url} alt="" width={32} height={32} /> : tool.name.slice(0, 1)}</div>{tool.verified && <span className="badge"><CheckCircle2 size={13} /> Verified</span>}</div><div className="muted" style={{ fontSize: 12, marginTop: 15 }}>{Array.isArray(tool.category) ? tool.category[0]?.name : tool.category?.name}</div><h2 style={{ fontSize: 20, margin: '4px 0' }}>{tool.name}</h2><p className="muted" style={{ margin: '0 0 14px' }}>{tool.short_description}</p><div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 'auto' }}><span className="badge">★ {tool.rating ?? 'New'}</span><span className="badge">{tool.pricing_type}</span><ArrowRight size={15} style={{ marginLeft: 'auto' }} /></div></Link>)}</div>}</main>
}
