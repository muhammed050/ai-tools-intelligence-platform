import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'

const fallback: Record<string, { title: string; description: string; content: string; updated: string; published: string }> = { 'how-to-choose-the-right-ai-tool': { title: 'How to choose the right AI tool', description: 'A practical framework for evaluating features, pricing, quality and fit.', content: 'Start with the outcome, not the feature list. Write down the job the tool must complete and how you will judge a good result.\n\nThen compare the workflow: integrations, export options, collaboration, privacy controls and the time it takes to reach a usable result.\n\nFinally, verify the economics. Test the free plan or trial, check limits that matter to your workload, and compare the total monthly cost rather than the headline price.', updated: '2026-01-01', published: '2026-01-01' }, 'best-ai-tools-for-content-creation': { title: 'Best AI tools for content creation', description: 'A decision guide for writing, images, video and voice workflows.', content: 'A strong content workflow usually combines a planning tool, a production tool and a review step. The best stack depends on the format and the amount of human editing you expect.\n\nFor writing, prioritize control and editability. For images and video, inspect consistency, licensing terms and export quality before committing to a subscription.\n\nUse the Eldevo directory to compare current pricing and run your exact workflow through AI Finder for a more tailored shortlist.', updated: '2026-01-01', published: '2026-01-01' }, 'ai-tool-stack-for-developers': { title: 'AI tool stack for developers', description: 'How to combine coding assistants, agents and research tools.', content: 'Developers get better results when each tool has a clear job. Pair an editor assistant with a research or documentation tool, then keep testing and code review in your normal development loop.\n\nEvaluate context handling, repository privacy, language support and how easily you can inspect generated changes. Speed is useful only when the result remains understandable.\n\nStart small, measure the time saved on a real project, and keep the tools that improve the whole workflow rather than just autocomplete.', updated: '2026-01-01', published: '2026-01-01' } }

async function getPost(slug: string) {
  try {
    const db = await createClient()
    const { data } = await db.from('articles').select('title,slug,excerpt,content,updated_at,published_at,seo_title,seo_description').eq('slug', slug).eq('status', 'published').maybeSingle()
    if (data) return { title: data.seo_title || data.title, slug: data.slug, description: data.seo_description || data.excerpt || '', content: data.content, updated: data.updated_at || data.published_at || new Date().toISOString(), published: data.published_at || data.updated_at || new Date().toISOString() }
    return fallback[slug] ? { ...fallback[slug], slug } : null
  } catch (error) {
    console.error('Article lookup failed', error)
    return fallback[slug] ? { ...fallback[slug], slug } : null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return { robots: { index: false, follow: false } }
  const canonical = `/blog/${post.slug}`
  return { title: post.title, description: post.description, alternates: { canonical }, openGraph: { title: post.title, description: post.description, type: 'article', url: canonical }, robots: { index: true, follow: true } }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug)
  if (!post) notFound()
  const siteUrl = getSiteUrl()
  const canonical = `${siteUrl}/blog/${post.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.published,
    dateModified: post.updated,
    author: { '@type': 'Organization', name: 'Eldevo', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'Eldevo', url: siteUrl, logo: { '@type': 'ImageObject', url: `${siteUrl}/icon.svg` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  }
  return <main className="container" style={{ padding: '58px 0 90px' }}><article style={{ maxWidth: 780, margin: '0 auto' }}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><nav className="muted" aria-label="Breadcrumb"><Link href="/blog">Blog</Link> / Guide</nav><div className="eyebrow" style={{ marginTop: 24 }}>AI Guide</div><h1 style={{ fontSize: 50, letterSpacing: '-.045em', lineHeight: 1.05, margin: '8px 0 16px' }}>{post.title}</h1><p className="muted" style={{ fontSize: 19 }}>{post.description}</p><div className="card" style={{ padding: '26px 30px', marginTop: 34 }}>{post.content.split(/\n\s*\n/).map((paragraph: string) => <p key={paragraph} style={{ fontSize: 18, lineHeight: 1.8 }}>{paragraph}</p>)}<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link className="btn btn-primary" href="/ai-finder">Find tools for your workflow</Link><Link className="btn btn-secondary" href="/tools">Browse directory</Link></div></div></article></main>
}
