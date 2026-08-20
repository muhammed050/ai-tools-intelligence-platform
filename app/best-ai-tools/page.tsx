import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Best AI Tools in 2026 | Eldevo',
  description: 'Find the best AI tools for writing, coding, images, video, voice, marketing and more. Tell Eldevo what you want to accomplish and get a tailored shortlist.',
  alternates: { canonical: '/best-ai-tools' },
}

const links = [
  ['Best AI video tools', '/best-ai-video-tools'],
  ['Best free AI video tools', '/best-free-ai-video-tools'],
  ['AI Finder', '/ai-finder'],
  ['Browse AI tools', '/tools'],
  ['Compare AI tools', '/compare'],
]

export default function BestAiToolsPage() {
  return <main className="container" style={{ padding: '58px 0 100px' }}>
    <section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}>
      <div className="tool-logo" style={{ margin: '0 auto 15px' }}><Sparkles size={23} /></div>
      <div className="eyebrow">Eldevo AI Tools Intelligence</div>
      <h1 style={{ fontSize: 'clamp(42px,6vw,68px)', lineHeight: 1, letterSpacing: '-.05em', margin: '12px 0' }}>Find the best AI tool for your job.</h1>
      <p className="muted" style={{ fontSize: 18, maxWidth: 720, margin: '0 auto 24px' }}>Stop browsing endless AI tool lists. Describe what you want to accomplish and Eldevo analyzes your needs, budget, features and platform to build a practical shortlist.</p>
      <Link className="btn btn-primary" href="/ai-finder">Tell Eldevo what you want to do <ArrowRight size={15} /></Link>
    </section>

    <section style={{ marginTop: 50 }}>
      <div className="eyebrow">Popular starting points</div>
      <h2>Explore AI tools by goal</h2>
      <div className="tool-grid" style={{ marginTop: 20 }}>{links.map(([title, href]) => <Link className="card tool-card" href={href} key={href}><h3>{title}</h3><p className="muted">Use Eldevo to discover, compare and choose with clearer quality and pricing signals.</p><span style={{ color: 'var(--brand)' }}>Explore <ArrowRight size={14} /></span></Link>)}</div>
    </section>

    <section className="card" style={{ padding: 30, marginTop: 50 }}>
      <div className="eyebrow">How Eldevo chooses</div>
      <h2>More than a list of tools</h2>
      <p className="muted">Eldevo combines intent detection, explicit requirement checks and deterministic ranking. If you ask for a free tool, a specific platform or a required feature, those requirements influence eligibility before recommendations are ranked.</p>
      <Link href="/about" className="btn btn-secondary">Learn about our methodology</Link>
    </section>
  </main>
}
