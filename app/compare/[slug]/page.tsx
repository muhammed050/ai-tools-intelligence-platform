import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'

type Tool = { id: string; name: string; slug: string; description: string; short_description: string; website_url: string; pricing_type: string | null; rating: number | null; review_count: number; verified: boolean; use_cases: string[]; platforms: string[]; pros: string[]; cons: string[]; category: { name: string; slug: string } | null; features: { name: string; slug: string }[]; pricing_plans: { name: string; price: number | null; currency: string; billing_period: string | null; is_free: boolean }[] }

async function getTools(slugs: string[]) {
  try {
    const db = await createClient()
    const { data } = await db.from('tools').select('id,name,slug,description,short_description,website_url,pricing_type,rating,review_count,verified,use_cases,platforms,pros,cons,category:categories(name,slug),features:tool_features(feature:features(name,slug)),pricing_plans(name,price,currency,billing_period,is_free)').in('slug', slugs).eq('status', 'published')
    const bySlug = new Map((data || []).map((row: any) => [row.slug, { ...row, category: Array.isArray(row.category) ? row.category[0] || null : row.category, features: (row.features || []).map((item: any) => item.feature).filter(Boolean), pricing_plans: row.pricing_plans || [] }]))
    return slugs.map((slug) => bySlug.get(slug)).filter(Boolean) as Tool[]
  } catch (error) {
    console.error('Comparison lookup failed', error)
    return []
  }
}

function display(value: string | number | null | undefined) { return value === null || value === undefined || value === '' ? 'Not verified' : value }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slugs = (await params).slug.split('-vs-')
  if (slugs.length < 2 || slugs.length > 4) return {}
  const tools = await getTools(slugs)
  if (tools.length !== slugs.length) return {}
  const title = tools.map((tool) => tool.name).join(' vs ')
  return { title: `${title} — AI Tools Comparison`, description: `Compare ${title} by pricing, ratings, features, platforms, strengths and limitations.`, alternates: { canonical: `/compare/${slugs.join('-vs-')}` }, openGraph: { title: `${title} comparison`, description: `A transparent comparison of ${title}.`, type: 'article' } }
}

export default async function CompareDetail({ params }: { params: Promise<{ slug: string }> }) {
  const slugs = (await params).slug.split('-vs-')
  if (slugs.length < 2 || slugs.length > 4 || new Set(slugs).size !== slugs.length) notFound()
  const tools = await getTools(slugs)
  if (tools.length !== slugs.length) notFound()
  const title = tools.map((tool) => tool.name).join(' vs ')
  const siteUrl = getSiteUrl()
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebPage', name: `${title} comparison`, description: `Compare ${title} by pricing, ratings, features, platforms, strengths and limitations.`, url: `${siteUrl}/compare/${slugs.join('-vs-')}` }
  const rows = [{ label: 'Category', values: tools.map((tool) => tool.category?.name || 'Not verified') }, { label: 'Pricing', values: tools.map((tool) => display(tool.pricing_type)) }, { label: 'Rating', values: tools.map((tool) => tool.rating === null ? 'No rating yet' : `${tool.rating} (${tool.review_count} reviews)`) }, { label: 'Platforms', values: tools.map((tool) => tool.platforms.length ? tool.platforms.join(', ') : 'Not verified') }, { label: 'Best for', values: tools.map((tool) => tool.use_cases.length ? tool.use_cases.join(', ') : 'Not verified') }, { label: 'Features', values: tools.map((tool) => tool.features.length ? tool.features.map((feature) => feature.name).join(', ') : 'No verified feature data') }, { label: 'Free plan', values: tools.map((tool) => tool.pricing_plans.some((plan) => plan.is_free) ? 'Available' : 'Not verified') }, { label: 'Pros', values: tools.map((tool) => tool.pros.length ? tool.pros.join(', ') : 'Not verified') }, { label: 'Limitations', values: tools.map((tool) => tool.cons.length ? tool.cons.join(', ') : 'Not verified') }]
  return <main className="container" style={{ padding: '55px 0 100px' }}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><nav className="muted" aria-label="Breadcrumb"><Link href="/compare">Compare</Link> / {title}</nav><div style={{ maxWidth: 880, marginTop: 18 }}><div className="eyebrow">Database comparison</div><h1 style={{ fontSize: 'clamp(36px,5vw,58px)', letterSpacing: '-.045em', margin: '7px 0 12px' }}>{title}</h1><p className="muted" style={{ fontSize: 18 }}>Compare published platform data side by side. Unknown values are labeled instead of estimated.</p></div><div style={{ overflowX: 'auto', marginTop: 30 }}><table className="comparison-table"><thead><tr><th scope="col">Criteria</th>{tools.map((tool) => <th scope="col" key={tool.id}><Link href={`/tools/${tool.slug}`}>{tool.name}</Link>{tool.verified && <span className="badge" style={{ marginLeft: 8 }}><CheckCircle2 size={12} /> Verified</span>}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${tools[index].id}`}>{value}</td>)}</tr>)}</tbody></table></div><section className="comparison-guidance card"><div className="eyebrow">How to choose</div><h2>Use the criteria that matter to your workflow.</h2><p className="muted">Start with the row that reflects your constraint: pricing for budget-sensitive work, platforms for your existing stack, and features or use cases for the job you need to complete. AITools leaves unknown fields clearly marked so the decision stays grounded in published data.</p></section><section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginTop: 30 }}>{tools.map((tool) => <article className="card" style={{ padding: 22 }} key={tool.id}><h2 style={{ marginTop: 0 }}>{tool.name}</h2><p className="muted">{tool.short_description}</p><Link className="btn btn-secondary" href={`/tools/${tool.slug}`}>Read full review <ArrowRight size={15} /></Link></article>)}</section></main>
}
