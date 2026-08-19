import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Affiliate disclosure', description: 'How Eldevo handles affiliate links and outbound tool referrals.', alternates: { canonical: '/affiliate-disclosure' } }

export default function AffiliateDisclosurePage() {
  return <main className="container" style={{ maxWidth: 820, padding: '56px 0 100px' }}><div className="eyebrow">Transparency</div><h1>Affiliate disclosure</h1><p>Eldevo may earn a commission when you visit a tool through an affiliate link. This does not change the price you pay, and it does not determine whether a tool is listed, reviewed, or recommended.</p><p>Where no affiliate link is available, Eldevo links to the tool’s normal website. We label outbound links transparently and keep editorial decisions independent from commercial relationships.</p></main>
}
