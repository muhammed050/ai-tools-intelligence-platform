import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { seoPages } from '@/app/seo-pages'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'

export function generateStaticParams() { return seoPages.filter(p => p.slug !== 'best-ai-tools').map(p => ({ slug: p.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = seoPages.find(p => p.slug === slug)
  if (!page) return {}
  const canonical = `${getSiteUrl()}/seo-pages/${page.slug}`
  return {
    title: `${page.title} | Eldevo`,
    description: page.description,
    alternates: { canonical, languages: { en: canonical, ar: `${getSiteUrl()}/ar/seo-pages/${page.slug}`, 'x-default': canonical } },
    openGraph: { type: 'article', title: page.title, description: page.description, url: canonical },
    robots: { index: true, follow: true },
  }
}

export default async function SeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = seoPages.find(p => p.slug === slug)
  if (!page || page.slug === 'best-ai-tools') notFound()

  const db = await createClient()
  const { data } = await db.from('tools').select('id,name,name_ar,slug,short_description,short_description_ar,logo_url,rating,review_count,pricing_type,verified').eq('status','published').order('rating',{ascending:false,nullsFirst:false}).limit(8)
  const tools = data || []
  const siteUrl = getSiteUrl()
  const canonical = `${siteUrl}/seo-pages/${page.slug}`
  const faq = [
    { q: `How do I choose from ${page.title.replace(/^Best /,'') }?`, a: 'Use Eldevo Finder with your task, budget, platform and required features. Eldevo ranks available tools against those requirements instead of assuming one tool is best for everyone.' },
    { q: 'Are these tools free?', a: 'Pricing varies by tool. Check each tool page for its current pricing information and verify the final price on the provider website before purchasing.' },
    { q: 'Can Eldevo compare the tools for me?', a: 'Yes. Start with Eldevo Finder to describe what you need, then compare shortlisted tools before visiting the provider.' },
  ]
  const faqSchema = { '@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(item=>({'@type':'Question',name:item.q,acceptedAnswer:{'@type':'Answer',text:item.a}})) }
  const collectionSchema = { '@context':'https://schema.org','@type':'CollectionPage',name:page.title,description:page.description,url:canonical,inLanguage:'en',isPartOf:{'@type':'WebSite',name:'Eldevo',url:siteUrl} }

  return <main className="container" style={{ padding: '58px 0 100px' }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <nav className="muted" aria-label="Breadcrumb"><Link href="/">Eldevo</Link> / <Link href="/tools">AI Tools</Link> / {page.title}</nav>
    <section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '16px auto 0' }}>
      <div className="tool-logo" style={{ margin: '0 auto 15px' }}><Sparkles size={23} /></div>
      <div className="eyebrow">{page.eyebrow}</div>
      <h1 style={{ fontSize: 'clamp(40px,6vw,64px)', lineHeight: 1, letterSpacing: '-.05em' }}>{page.title}</h1>
      <p className="muted" style={{ fontSize: 18, maxWidth: 720, margin: '18px auto 25px' }}>{page.description}</p>
      <Link className="btn btn-primary" href={`/ai-finder?q=${encodeURIComponent(page.query)}`}>Find my best match <ArrowRight size={15} /></Link>
    </section>

    <section style={{ marginTop: 45 }}>
      <div className="section-head"><div><div className="eyebrow">Eldevo recommendations</div><h2>Start with tools, then choose based on your needs</h2></div><Link className="btn btn-secondary" href="/tools">Browse all tools <ArrowRight size={15}/></Link></div>
      <div className="tool-grid">{tools.map((tool:any) => <article className="card tool-card" key={tool.id} style={{display:'flex',flexDirection:'column',gap:10}}>{tool.logo_url ? <img src={tool.logo_url} alt={`${tool.name} logo`} width={48} height={48} loading="lazy" style={{borderRadius:12,objectFit:'cover'}}/> : <div className="tool-logo">{tool.name.slice(0,1)}</div>}<h3 style={{margin:0}}>{tool.name}</h3><p className="muted" style={{margin:0}}>{tool.short_description}</p><div style={{display:'flex',gap:10,flexWrap:'wrap',fontSize:13}}><span>★ {tool.rating ?? '—'} ({tool.review_count ?? 0})</span>{tool.verified&&<span className="badge"><CheckCircle2 size={12}/> Verified</span>}<span>{tool.pricing_type || 'Pricing varies'}</span></div><Link style={{marginTop:'auto'}} href={`/tools/${tool.slug}`}>Read review & details <ArrowRight size={13}/></Link></article>)}</div>
    </section>

    <section className="card" style={{padding:26,marginTop:34}}>
      <h2>Choose based on your actual needs</h2>
      <p className="muted">Eldevo does not assume one tool is best for everyone. Describe your task, budget, required features and platform, and the Finder ranks available options against those requirements.</p>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:14}}><Link className="btn btn-secondary" href={`/ai-finder?q=${encodeURIComponent(page.query)}`}>Use Finder</Link><Link className="btn btn-secondary" href="/compare">Compare tools</Link></div>
    </section>

    <section style={{marginTop:34}}><h2>Frequently asked questions</h2>{faq.map(item=><details className="card" style={{padding:18,marginTop:10}} key={item.q}><summary style={{fontWeight:700,cursor:'pointer'}}>{item.q}</summary><p className="muted" style={{marginBottom:0}}>{item.a}</p></details>)}</section>
  </main>
}
