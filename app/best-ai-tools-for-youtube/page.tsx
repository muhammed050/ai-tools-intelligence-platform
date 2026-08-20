import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export const metadata: Metadata = { title: 'Best AI Tools for YouTube in 2026 | Eldevo', description: 'Find AI tools for YouTube scripts, videos, voiceovers, thumbnails and channel workflows.', alternates: { canonical: '/best-ai-tools-for-youtube' } }

export default function Page() {
  return <main className="container" style={{ padding: '58px 0 100px' }}><section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}><div className="tool-logo" style={{ margin: '0 auto 15px' }}><Sparkles size={23} /></div><div className="eyebrow">YouTube AI tools</div><h1 style={{ fontSize: 'clamp(40px,6vw,64px)', lineHeight: 1, letterSpacing: '-.05em' }}>Best AI tools for YouTube</h1><p className="muted" style={{ fontSize: 18, maxWidth: 720, margin: '18px auto 25px' }}>Find tools for scripts, video creation, voiceovers, thumbnails and channel workflows. Describe your exact goal and Eldevo will narrow the options.</p><Link className="btn btn-primary" href="/ai-finder">Find my YouTube tools <ArrowRight size={15} /></Link></section><section style={{ marginTop: 45 }}><h2>Build your YouTube AI stack</h2><p className="muted">Different creators need different tools. Eldevo evaluates your budget, experience, platform and required features instead of assuming one tool fits everyone.</p><div className="tool-grid" style={{ marginTop: 22 }}>{['Script writing','Video generation','AI voiceovers','Thumbnails','SEO and research'].map((item) => <div className="card tool-card" key={item}><h3>{item}</h3><p className="muted">Tell Eldevo what you need and get a ranked shortlist for this step.</p></div>)}</div></section></main>
}
