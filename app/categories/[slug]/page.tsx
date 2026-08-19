import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getCategory(slug: string) {
  const db = await createClient()
  const { data } = await db.from('categories').select('id,name,slug,description,seo_title,seo_description').eq('slug', slug).maybeSingle()
  if (!data) return null
  const { data: tools } = await db.from('tools').select('id,name,slug,short_description,rating,review_count,pricing_type,logo_url,verified').eq('category_id', data.id).eq('status', 'published').order('featured', { ascending: false }).order('rating', { ascending: false, nullsFirst: false }).limit(24)
  return { category: data, tools: tools || [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const result = await getCategory((await params).slug)
  if (!result) return {}
  return { title: result.category.seo_title || `${result.category.name} AI Tools`, description: result.category.seo_description || result.category.description, alternates: { canonical: `/categories/${result.category.slug}` } }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const result = await getCategory((await params).slug)
  if (!result) notFound()
  const { category, tools } = result
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tools-intelligence-platform-iota.vercel.app'
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: category.name, description: category.description, url: `${siteUrl}/categories/${category.slug}` }
  return <main className="container" style={{ padding: '58px 0 90px' }}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><nav className="muted" aria-label="Breadcrumb"><Link href="/categories">Categories</Link> / {category.name}</nav><div style={{ maxWidth: 760, marginTop: 18 }}><div className="eyebrow">AI software category</div><h1 style={{ fontSize: 48, letterSpacing: '-.045em', margin: '7px 0 10px' }}>{category.name} AI tools</h1><p className="muted" style={{ fontSize: 18 }}>{category.description}</p></div><section style={{ marginTop: 34 }}><div className="section-head"><div><h2>Popular {category.name} tools</h2><p className="muted">Curated listings with current pricing and quality signals.</p></div><Link className="btn btn-secondary" href={`/tools?category=${category.slug}`}>View directory <ArrowRight size={15} /></Link></div>{!tools.length ? <div className="card" style={{ padding: 28 }}><h3>Tools are being curated</h3><p className="muted">Check the full directory or describe your goal in AI Finder.</p></div> : <div className="tool-grid">{tools.map((tool: any) => <Link className="card tool-card" href={`/tools/${tool.slug}`} key={tool.id}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div className="tool-logo">{tool.logo_url ? <img src={tool.logo_url} alt="" width={32} height={32} /> : tool.name.slice(0, 1)}</div>{tool.verified && <span className="badge"><CheckCircle2 size={13} /> Verified</span>}</div><h3 style={{ margin: '18px 0 4px' }}>{tool.name}</h3><p className="muted" style={{ margin: 0 }}>{tool.short_description}</p><div style={{ marginTop: 'auto', paddingTop: 18, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>★ {tool.rating ?? '—'} {tool.review_count ? `(${tool.review_count})` : ''}</span><span>{tool.pricing_type}</span></div></Link>)}</div>}</section><section className="card" style={{ padding: 26, marginTop: 34 }}><h2>Find your best match</h2><p className="muted">Tell AI Finder what you need, including your budget, workflow, and preferred platform.</p><Link className="btn btn-primary" href="/ai-finder">Use AI Finder <ArrowRight size={15} /></Link></section></main>
}