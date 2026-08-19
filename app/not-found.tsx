import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page Not Found', robots: { index: false, follow: true } }

export default function NotFound() { return <main className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '60px 0' }}><section className="card directory-empty"><div className="eyebrow">404</div><h1>We could not find that page.</h1><p className="muted">The tool, guide, category or comparison may have moved.</p><div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}><Link className="btn btn-primary" href="/tools">Browse AI tools</Link><Link className="btn btn-secondary" href="/ai-finder">Try AI Finder</Link></div></section></main> }