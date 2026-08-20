import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export const metadata: Metadata = { title: 'Best ChatGPT Alternatives in 2026 | Eldevo', description: 'Compare ChatGPT alternatives based on your actual task, budget, features, platform and workflow.', alternates: { canonical: '/chatgpt-alternatives' } }

export default function Page() {
  return <main className="container" style={{ padding: '58px 0 100px' }}><section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}><div className="tool-logo" style={{ margin: '0 auto 15px' }}><Sparkles size={23} /></div><div className="eyebrow">AI assistant alternatives</div><h1 style={{ fontSize: 'clamp(40px,6vw,64px)', lineHeight: 1, letterSpacing: '-.05em' }}>Best ChatGPT alternatives</h1><p className="muted" style={{ fontSize: 18, maxWidth: 720, margin: '18px auto 25px' }}>There is no universal best AI assistant. Tell Eldevo what you need and compare alternatives using the requirements that matter to you.</p><Link className="btn btn-primary" href="/ai-finder">Find my alternative <ArrowRight size={15} /></Link></section><section style={{ marginTop: 45 }}><h2>Choose by use case, not hype</h2><p className="muted">Coding, research, writing, business and creative tasks can need very different capabilities. Eldevo ranks candidates against your actual request.</p></section></main>
}
