import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { FavoritesGrid } from '@/components/favorites-grid'

export const metadata = { title: 'Favorite AI Tools', robots: { index: false, follow: false } }

export default async function Favorites() {
  const user = await getUser()
  if (!user) redirect('/auth/sign-in?next=/favorites')
  const db = await createClient()
  const { data } = await db.from('favorites').select('tool:tools(id,name,slug,short_description,rating,pricing_type)').eq('user_id', user.id).order('created_at', { ascending: false })
  const tools = (data || []).map((favorite: any) => Array.isArray(favorite.tool) ? favorite.tool[0] : favorite.tool).filter(Boolean)
  return <main className="container" style={{ padding: '58px 0 90px' }}><div className="eyebrow">Your library</div><h1 style={{ fontSize: 46, letterSpacing: '-.04em', margin: '6px 0' }}>Favorite AI tools</h1><p className="muted">Keep the tools worth revisiting close at hand.</p><div style={{ marginTop: 28 }}><FavoritesGrid initialTools={tools} /></div></main>
}