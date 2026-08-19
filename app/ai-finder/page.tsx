'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, GitCompareArrows, Search, Sparkles, WandSparkles } from 'lucide-react'

const examples = ['Create TikTok videos', 'Generate product photos', 'Clone a voice', 'Build a website', 'Write SEO articles', 'Analyze documents']

export default function FinderPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/ai-finder', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }) })
      const result = await response.json()
      if (!response.ok) throw new Error(response.status === 429 ? result.error : 'The Finder is temporarily unavailable. Please try again shortly.')
      setData(result)
    } catch (reason) {
      setData(null)
      setError(reason instanceof Error ? reason.message : 'The Finder is temporarily unavailable. Please try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="container" style={{ padding: '60px 0 100px' }}><section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}><div className="tool-logo" style={{ margin: '0 auto 15px' }}><WandSparkles size={23} /></div><div className="eyebrow">AI-powered discovery</div><h1 style={{ fontSize: 'clamp(42px,6vw,68px)', lineHeight: 1, letterSpacing: '-.05em', margin: '12px 0' }}>What are you trying to accomplish?<br /><span style={{ color: '#9f94ff' }}>We will find the tools.</span></h1><p className="muted" style={{ fontSize: 17, maxWidth: 720, margin: '0 auto' }}>Describe your goal, budget or constraints in plain English. AITools extracts your intent and ranks relevant software from the directory.</p><form onSubmit={submit} style={{ maxWidth: 820, margin: '28px auto 0', display: 'flex', gap: 10 }}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. free AI video generator for short TikTok clips" minLength={3} required aria-label="Describe what AI tool you need" /><button className="btn btn-primary" disabled={loading}><Sparkles size={16} />{loading ? 'Finding...' : 'Find tools'}</button></form><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}>{examples.map((example) => <button key={example} type="button" className="btn btn-secondary" onClick={() => setQuery(example)}>{example}</button>)}</div></section>{error && <div className="card" role="alert" style={{ padding: 18, marginTop: 24, borderColor: '#7f1d1d' }}>{error}</div>}{data && <section style={{ marginTop: 36 }}>{data.source !== 'ai' && <div className="card" role="status" style={{ padding: 18, marginBottom: 20, borderColor: '#6d5dd3' }}><strong>AI-enhanced ranking is temporarily unavailable.</strong> Here are the best matches from our directory.</div>}<div className="card" style={{ padding: 20 }}><div className="eyebrow">Detected intent · {data.source === 'ai' ? 'AI extraction' : 'Local fallback'}</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>{Object.entries(data.intent).flatMap(([key, value]: any) => Array.isArray(value) ? value.map((item: string) => <span className="badge" key={`${key}-${item}`}>{key}: {item}</span>) : value ? <span className="badge" key={key}>{key}: {value}</span> : [])}</div></div>{data.results.map((group: any) => <div key={group.key} style={{ marginTop: 32 }}><div className="section-head"><h2>{group.label}</h2><span className="muted">{group.items.length} match{group.items.length === 1 ? '' : 'es'}</span></div><div className="tool-grid">{group.items.map((recommendation: any) => <article className="card tool-card" key={`${group.key}-${recommendation.tool.id}`}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div><div className="eyebrow">{recommendation.tool.category?.name || 'AI tool'}</div><h3 style={{ fontSize: 22, margin: '4px 0' }}>{recommendation.tool.name}</h3></div><strong style={{ fontSize: 22, color: '#a79cff' }}>{recommendation.score}%</strong></div><p className="muted">{recommendation.tool.short_description}</p><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}><span className="badge">★ {recommendation.tool.rating ?? 'Unrated'}</span><span className="badge">{recommendation.tool.pricing_type}</span>{recommendation.tool.verified && <span className="badge"><CheckCircle2 size={13} /> Verified</span>}</div><h4 style={{ margin: '18px 0 6px' }}>Why we recommend it</h4>{recommendation.why.length ? <ul style={{ paddingLeft: 20, marginTop: 0 }}>{recommendation.why.map((reason: string) => <li key={reason}>{reason}</li>)}</ul> : <p className="muted">A strong directory match based on your request.</p>}{recommendation.limitations.length > 0 && <p className="muted" style={{ fontSize: 13 }}>Limitations: {recommendation.limitations.join(', ')}</p>}<div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, flexWrap: 'wrap' }}><Link className="btn btn-primary" href={`/go/${recommendation.tool.slug}`}>Visit tool <ArrowRight size={14} /></Link><Link className="btn btn-secondary" href={`/tools/${recommendation.tool.slug}`}>Details <Search size={14} /></Link><Link className="btn btn-secondary" href={`/compare/${recommendation.tool.slug}`}><GitCompareArrows size={14} /> Compare</Link></div></article>)}</div></div>)}</section>}</main>
}
