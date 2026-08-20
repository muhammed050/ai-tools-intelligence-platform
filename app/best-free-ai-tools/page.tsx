import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export const metadata: Metadata = { title: 'Best Free AI Tools in 2026 | Eldevo', description: 'Find useful free AI tools across writing, images, video, coding, voice and productivity.', alternates: { canonical: '/best-free-ai-tools' } }

export default function Page() {
  return <main className="container" style={{ padding: '58px 0 100px' }}><section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}><div className="tool-logo" style={{ margin: '0 auto 15px' }}><Sparkles size={23} /></div><div className="eyebrow">Free AI tools</div><h1 style={{ fontSize: 'clamp(40px,6vw,64px)', lineHeight: 1, letterSpacing: '-.05em' }}>Best free AI tools</h1><p className="muted" style={{ fontSize: 18, maxWidth: 720, margin: '18px auto 25px' }}>Looking for AI tools without paying? Tell Eldevo what you need. Your free-budget requirement becomes a hard filter before tools are ranked.</p><Link className="btn btn-primary" href="/ai-finder">Find free tools <ArrowRight size={15} /></Link></section><section style={{ marginTop: 45 }}><h2>Free does not mean one-size-fits-all</h2><p className="muted">A tool can be free but still fail your needs. Eldevo considers your task, required features, platform and experience before recommending a match.</p></section></main>
}
