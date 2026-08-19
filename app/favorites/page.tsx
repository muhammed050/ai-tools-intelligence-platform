import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export const metadata = { title: 'Favorite AI Tools', robots: { index: false, follow: false } }

export default async function Favorites() {
  const user = await getUser()
  if (!user) redirect('/auth/sign-in?next=/favorites')
  const db = await createClient()
  const { data } = await db.from('favorites').select('tool:tools(id,name,slug,short_description,rating,pricing_type)').eq('user_id', user.id).order('created_at', { ascending: false })
  const tools = (data || []).map((favorite: any) => Array.isArray(favorite.tool) ? favorite.tool[0] : favorite.tool).filter(Boolean)
  return <main className="container" style={{ padding: '58px 0 90px' }}><div className="eyebrow">Your library</div><h1 style={{ fontSize: 46, letterSpacing: '-.04em', margin: '6px 0' }}>Favorite AI tools</h1><p className="muted">Keep the tools worth revisiting close at hand.</p>{!tools.length ? <div className="card" style={{ padding: 30, marginTop: 28 }}><h2>Your library is empty</h2><p className="muted">Save tools from the directory to build a shortlist.</p><Link className="btn btn-primary" href="/tools">Browse tools</Link></div> : <div className="tool-grid" style={{ marginTop: 28 }}>{tools.map((tool: any) => <Link className="card tool-card" href={`/tools/${tool.slug}`} key={tool.id}><h2 style={{ margin: 0 }}>{tool.name}</h2><p className="muted">{tool.short_description}</p><div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>★ {tool.rating ?? '—'}</span><span>{tool.pricing_type}</span></div></Link>)}</div>}</main>
}