import './globals.css'
import Link from 'next/link'
import { getProfile, getUser } from '@/lib/auth'
import { AuthNav } from '@/components/auth-nav'
import { Search, Sparkles, Grid2X2, GitCompareArrows, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tools-intelligence-platform-iota.vercel.app'
export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'AI Tools Intelligence — Find the Best AI Tools', template: '%s | AI Tools Intelligence' },
  description: 'Discover, compare and find the best AI tools for writing, coding, design, video, voice, research and business.',
  keywords: ['AI tools','AI tool finder','best AI tools','AI software','AI directory','AI tools comparison'],
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'AI Tools Intelligence', title: 'Find the Best AI Tools for Any Task', description: 'AI-powered discovery, comparisons and curated software recommendations.', url: siteUrl },
  twitter: { card: 'summary_large_image', title: 'AI Tools Intelligence', description: 'Find the right AI tool for any task.' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
}
const nav = [
  { href: '/ai-finder', label: 'AI Finder', icon: Sparkles }, { href: '/tools', label: 'Tools', icon: Search },
  { href: '/categories', label: 'Categories', icon: Grid2X2 }, { href: '/compare', label: 'Compare', icon: GitCompareArrows }, { href: '/blog', label: 'Blog', icon: BookOpen },
]
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser(); const profile = await getProfile()
  const jsonLd = { '@context':'https://schema.org','@type':'WebSite',name:'AI Tools Intelligence',url:siteUrl,description:'AI-powered directory and finder for AI software.',potentialAction:{'@type':'SearchAction',target:`${siteUrl}/tools?q={search_term_string}`,'query-input':'required name=search_term_string'} }
  return <html lang="en"><body>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header"><div className="container nav-shell">
      <Link href="/" className="brand" aria-label="AI Tools Intelligence home"><span className="brand-mark"><Sparkles size={17}/></span><span>AI<span>Tools</span></span></Link>
      <nav className="main-nav" aria-label="Primary navigation">{nav.map(({href,label,icon:Icon})=><Link key={href} href={href}><Icon size={16}/><span>{label}</span></Link>)}</nav>
      <AuthNav userEmail={user?.email} role={profile?.role}/>
    </div></header>
    <div id="main-content">{children}</div>
    <footer className="site-footer"><div className="container footer-grid">
      <div><Link href="/" className="brand footer-brand"><span className="brand-mark"><Sparkles size={16}/></span><span>AI<span>Tools</span></span></Link><p className="muted footer-copy">A smarter way to discover, compare and evaluate AI software.</p></div>
      <div><h3>Explore</h3><Link href="/ai-finder">AI Finder</Link><Link href="/tools">AI Tools</Link><Link href="/categories">Categories</Link><Link href="/compare">Compare Tools</Link></div>
      <div><h3>Resources</h3><Link href="/blog">AI Guides</Link><Link href="/submit-tool">Submit a Tool</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></div>
      <div><h3>Legal</h3><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><div className="trust-note"><ShieldCheck size={15}/> Editorially curated</div></div>
    </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} AI Tools Intelligence</span><Link href="/ai-finder">Find your next AI tool <ArrowRight size={14}/></Link></div></footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
  </body></html>
}
