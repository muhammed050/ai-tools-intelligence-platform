import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'
import { seoPages } from '@/app/seo-pages'

export function generateStaticParams() { return seoPages.filter(p => p.slug !== 'best-ai-tools').map(p => ({ slug: p.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = seoPages.find(p => p.slug === slug)
  if (!page) return {}
  return { title: `${page.title} | Eldevo`, description: page.description, alternates: { canonical: `/seo-pages/${page.slug}` } }
}

export default async function SeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = seoPages.find(p => p.slug === slug)
  if (!page || page.slug === 'best-ai-tools') notFound()
  return <main className="container" style={{ padding: '58px 0 100px' }}><section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}><div className="tool-logo" style={{ margin: '0 auto 15px' }}><Sparkles size={23} /></div><div className="eyebrow">{page.eyebrow}</div><h1 style={{ fontSize: 'clamp(40px,6vw,64px)', lineHeight: 1, letterSpacing: '-.05em' }}>{page.title}</h1><p className="muted" style={{ fontSize: 18, maxWidth: 720, margin: '18px auto 25px' }}>{page.description}</p><Link className="btn btn-primary" href={`/ai-finder?q=${encodeURIComponent(page.query)}`}>Find my best match <ArrowRight size={15} /></Link></section><section style={{ marginTop: 45 }}><h2>Choose based on your actual needs</h2><p className="muted">Eldevo does not assume one tool is best for everyone. Describe your task, budget, required features and platform, and the Finder ranks the available options against those requirements.</p></section></main>
}
