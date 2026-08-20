import './globals.css'
import './header.css'
import Link from 'next/link'
import type { Route } from 'next'
import { cookies } from 'next/headers'
import { ArrowRight, Grid2X2, ShieldCheck, Sparkles } from 'lucide-react'
import { getProfile, getUser } from '@/lib/auth'
import { AuthNavMain } from '@/components/auth-nav-main'
import { GlobalSearch } from '@/components/global-search'
import { MobileNav } from '@/components/mobile-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ArabicAutoTranslate } from '@/components/arabic-auto-translate'
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'
import { getDictionary, normalizeLocale, LOCALE_COOKIE } from '@/lib/i18n'

const siteUrl = getSiteUrl()
export const metadata = { metadataBase: new URL(siteUrl), title: { default: 'Eldevo — AI Tools Intelligence', template: '%s | Eldevo' }, description: SITE_DESCRIPTION, keywords: ['AI tools', 'AI tool finder', 'AI workflows', 'AI software directory'], alternates: { canonical: '/' }, openGraph: { type: 'website', siteName: SITE_NAME, title: 'Eldevo — AI Tools Intelligence', description: SITE_DESCRIPTION, url: siteUrl }, twitter: { card: 'summary_large_image', title: 'Eldevo — AI Tools Intelligence', description: SITE_DESCRIPTION }, robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } } }

const nav = [
  { href: '/ai-finder', key: 'finder', icon: Sparkles },
  { href: '/tools', key: 'tools', icon: Sparkles },
  { href: '/categories', key: 'categories', icon: Grid2X2 },
] as const

export default async function Layout({ children }: { children: React.ReactNode }) {
  const locale = normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value)
  const t = getDictionary(locale)
  const [user, profile] = await Promise.all([getUser(), getProfile()])
  const localized = (path: string) => (path || '/') as Route
  const jsonLd = { '@context': 'https://schema.org', '@graph': [ { '@type': 'Organization', name: SITE_NAME, url: siteUrl, logo: `${siteUrl}/favicon.svg` }, { '@type': 'WebSite', name: SITE_NAME, url: siteUrl, description: SITE_DESCRIPTION, potentialAction: { '@type': 'SearchAction', target: `${siteUrl}/tools?q={search_term_string}`, 'query-input': 'required name=search_term_string' } } ] }
  return <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}><body><a className="skip-link" href="#main-content">{t.skip}</a><header className="site-header"><div className="container nav-shell"><Link href={localized('/')} className="brand" aria-label="Eldevo home"><span className="brand-mark"><Sparkles size={17} /></span><span>Eldevo</span></Link><nav className="main-nav" aria-label={locale === 'ar' ? 'التنقل الرئيسي' : 'Primary navigation'}>{nav.map(({ href, key, icon: Icon }) => <Link key={href} href={localized(href)}><Icon size={16} /><span>{t.nav[key]}</span></Link>)}</nav><GlobalSearch /><div className="header-actions"><LanguageSwitcher locale={locale} /><AuthNavMain userEmail={user?.email} role={profile?.role} locale={locale} /></div><MobileNav locale={locale} /></div></header><div id="main-content">{children}</div><footer className="site-footer"><div className="container footer-grid"><div><Link href={localized('/')} className="brand footer-brand"><span className="brand-mark"><Sparkles size={16} /></span><span>Eldevo</span></Link><p className="muted footer-copy">{t.footer.description}</p></div><div><h3>{t.footer.explore}</h3><Link href={localized('/ai-finder')}>{t.nav.finder}</Link><Link href={localized('/tools')}>{t.footer.aiTools}</Link><Link href={localized('/categories')}>{t.nav.categories}</Link><Link href={localized('/compare')}>{t.footer.compareTools}</Link></div><div><h3>{t.footer.resources}</h3><Link href={localized('/blog')}>{t.footer.aiGuides}</Link><Link href={localized('/submit-tool')}>{t.footer.submit}</Link></div><div><h3>{t.footer.trust}</h3><Link href={localized('/about')}>{t.footer.about}</Link><Link href={localized('/privacy')}>{t.footer.privacy}</Link><Link href={localized('/affiliate-disclosure')}>{t.footer.disclosure}</Link><div className="trust-note"><ShieldCheck size={15} /> {t.footer.curated}</div></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Eldevo</span><Link href={localized('/ai-finder')}>{t.footer.cta} <ArrowRight size={14} /></Link></div></footer><ArabicAutoTranslate /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></body></html>
}
