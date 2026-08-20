import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { FavoriteButton } from '@/components/favorite-button'

type Locale = 'en' | 'ar'
type Tool = { id: string; name: string; name_ar?: string | null; slug: string; short_description: string; short_description_ar?: string | null; rating: number | null; review_count: number; pricing_type: string | null; logo_url: string | null; verified: boolean; category: { name: string; name_ar?: string | null; slug: string } | { name: string; name_ar?: string | null; slug: string }[] | null }

export function HomeToolSection({ eyebrow, title, tools, locale = 'en' }: { eyebrow: string; title: string; tools: Tool[]; locale?: Locale }) {
  if (!tools.length) return null
  const ar = locale === 'ar'
  return <section className="container" style={{ padding: '54px 0 0' }}>
    <div className="section-head"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div><Link className="btn btn-secondary" href="/tools">{ar ? 'عرض جميع الأدوات' : 'View directory'} <ArrowRight size={15} /></Link></div>
    <div className="tool-grid">{tools.map((tool) => {
      const category = Array.isArray(tool.category) ? tool.category[0] : tool.category
      const name = ar ? (tool.name_ar || tool.name) : tool.name
      const description = ar ? (tool.short_description_ar || tool.short_description) : tool.short_description
      const categoryName = ar ? (category?.name_ar || category?.name || 'أداة ذكاء اصطناعي') : (category?.name || 'AI software')
      const pricing = tool.pricing_type || (ar ? 'غير معروف' : 'Pricing unknown')
      return <article className="card tool-card" key={tool.id}>
        <Link href={`/tools/${tool.slug}`} className="tool-card-link"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div className="tool-logo">{tool.logo_url ? <img src={tool.logo_url} alt={`${name} logo`} width={32} height={32} /> : name.slice(0, 1)}</div>{tool.verified && <span className="badge"><CheckCircle2 size={13} /> {ar ? 'موثقة' : 'Verified'}</span>}</div><div className="muted" style={{ marginTop: 15, fontSize: 12 }}>{categoryName}</div><h3 style={{ margin: '4px 0' }}>{name}</h3><p className="muted" style={{ margin: 0 }}>{description}</p><div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 'auto', paddingTop: 16, fontSize: 13 }}><span>★ {tool.rating ?? (ar ? 'غير مقيمة' : 'Unrated')} {tool.review_count ? `(${tool.review_count})` : ''}</span><span className="badge">{pricing}</span></div></Link><div className="tool-card-actions"><FavoriteButton toolId={tool.id} /><Link className="btn btn-primary" href={`/tools/${tool.slug}`}>{ar ? 'عرض التفاصيل' : 'View details'} <ArrowRight size={14} /></Link></div>
      </article>
    })}</div>
  </section>
}
