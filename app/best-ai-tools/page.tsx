import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Best AI Tools in 2026 | Eldevo',
  description: 'Find the best AI tools for writing, coding, images, video, voice, marketing and more. Compare pricing, quality signals, use cases and alternatives.',
  alternates: { canonical: '/best-ai-tools' },
  openGraph: { title: 'Best AI Tools in 2026 | Eldevo', description: 'Compare useful AI tools by task, pricing, quality signals and fit.', type: 'website' },
  robots: { index: true, follow: true },
}

const links: [string, string][] = [
  ['Best AI video tools', '/best-ai-video-tools'],
  ['Best free AI video tools', '/best-free-ai-video-tools'],
  ['Best AI tools for YouTube', '/best-ai-tools-for-youtube'],
  ['Best AI tools for TikTok', '/best-ai-tools-for-tiktok'],
  ['AI Finder', '/ai-finder'],
  ['Browse AI tools', '/tools'],
  ['Compare AI tools', '/compare'],
]

export default async function BestAiToolsPage() {
  let tools: any[] = []
  try {
    const db = await createClient()
    const { data } = await db.from('tools').select('id,name,slug,short_description,rating,review_count,pricing_type,logo_url,verified').eq('status', 'published').order('featured', { ascending: false }).order('rating', { ascending: false, nullsFirst: false }).limit(12)
    tools = data || []
  } catch (error) { console.error('Best tools page data unavailable', error) }
  const siteUrl = getSiteUrl()
  const itemList = tools.map((tool, index) => ({ '@type': 'ListItem', position: index + 1, name: tool.name, url: `${siteUrl}/tools/${tool.slug}` }))
  const jsonLd = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Best AI Tools in 2026', url: `${siteUrl}/best-ai-tools`, itemListElement: itemList }

  return <main className="container" style={{ padding: '58px 0 100px' }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}><div className="tool-logo" style={{ margin: '0 auto 15px' }}><Sparkles size={23} /></div><div className="eyebrow">Eldevo AI Tools Intelligence</div><h1 style={{ fontSize: 'clamp(42px,6vw,68px)', lineHeight: 1, letterSpacing: '-.05em', margin: '12px 0' }}>Find the best AI tool for your job.</h1><p className="muted" style={{ fontSize: 18, maxWidth: 720, margin: '0 auto 24px' }}>Stop browsing endless AI tool lists. Describe what you want to accomplish and Eldevo analyzes your needs, budget, features and platform to build a practical shortlist.</p><Link className="btn btn-primary" href="/ai-finder">Tell Eldevo what you want to do <ArrowRight size={15} /></Link></section>

    <section style={{ marginTop: 50 }}><div className="eyebrow">Our current shortlist</div><h2>Featured AI tools worth evaluating</h2><p className="muted" style={{ maxWidth: 760 }}>These published tools are ranked using Eldevo quality signals such as ratings, review volume, verification and featured status. Always verify current pricing and capabilities on the provider site.</p><div className="tool-grid" style={{ marginTop: 20 }}>{tools.map((tool) => <Link className="card tool-card" href={`/tools/${tool.slug}`} key={tool.id}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div className="tool-logo">{tool.logo_url ? <img src={tool.logo_url} alt={`${tool.name} logo`} width={32} height={32} /> : tool.name.slice(0, 1)}</div>{tool.verified && <span className="badge"><CheckCircle2 size={13} /> Verified</span>}</div><h3 style={{ margin: '18px 0 4px' }}>{tool.name}</h3><p className="muted" style={{ margin: 0 }}>{tool.short_description}</p><div style={{ marginTop: 'auto', paddingTop: 18, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>★ {tool.rating ?? '—'} {tool.review_count ? `(${tool.review_count})` : ''}</span><span>{tool.pricing_type || 'Pricing varies'}</span></div></Link>)}</div></section>

    <section style={{ marginTop: 50 }}><div className="eyebrow">Popular starting points</div><h2>Explore AI tools by goal</h2><div className="tool-grid" style={{ marginTop: 20 }}>{links.map(([title, href]) => <Link className="card tool-card" href={href as any} key={href}><h3>{title}</h3><p className="muted">Use Eldevo to discover, compare and choose with clearer quality and pricing signals.</p><span style={{ color: 'var(--brand)' }}>Explore <ArrowRight size={14} /></span></Link>)}</div></section>

    <section className="card" style={{ padding: 30, marginTop: 50 }}><div className="eyebrow">How Eldevo chooses</div><h2>More than a list of tools</h2><p className="muted">Eldevo combines intent detection, explicit requirement checks and deterministic ranking. If you ask for a free tool, a specific platform or a required feature, those requirements influence eligibility before recommendations are ranked.</p><Link href="/about" className="btn btn-secondary">Learn about our methodology</Link></section>
  </main>
}
