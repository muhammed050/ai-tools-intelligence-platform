import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export const metadata: Metadata = { title: 'Best AI Tools for TikTok in 2026 | Eldevo', description: 'Find AI tools for TikTok videos, scripts, captions, voiceovers and short-form content.', alternates: { canonical: '/best-ai-tools-for-tiktok' } }

export default function Page() {
  return <main className="container" style={{ padding: '58px 0 100px' }}><section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}><div className="tool-logo" style={{ margin: '0 auto 15px' }}><Sparkles size={23} /></div><div className="eyebrow">TikTok AI tools</div><h1 style={{ fontSize: 'clamp(40px,6vw,64px)', lineHeight: 1, letterSpacing: '-.05em' }}>Best AI tools for TikTok</h1><p className="muted" style={{ fontSize: 18, maxWidth: 720, margin: '18px auto 25px' }}>Discover tools for short videos, scripts, captions, voiceovers and fast content workflows. Eldevo matches the recommendation to your requirements.</p><Link className="btn btn-primary" href="/ai-finder">Find my TikTok tools <ArrowRight size={15} /></Link></section><section style={{ marginTop: 45 }}><h2>Create a complete TikTok workflow</h2><p className="muted">Start with your goal, budget and experience. Eldevo can recommend the right combination instead of forcing a single tool.</p><div className="tool-grid" style={{ marginTop: 22 }}>{['Video generation','Scripts and ideas','Voiceovers','Captions','Content optimization'].map((item) => <div className="card tool-card" key={item}><h3>{item}</h3><p className="muted">Use the Finder to get a ranked shortlist for this part of your workflow.</p></div>)}</div></section></main>
}
