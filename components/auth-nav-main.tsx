'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Bookmark, FolderHeart, LayoutDashboard, LogOut, Shield, UserRound } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'

export function AuthNavMain({ userEmail, role, locale = 'en' }: { userEmail?: string | null; role?: string | null; locale?: 'en' | 'ar' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const t = getDictionary(locale).auth
  const prefix = locale === 'ar' ? '/ar' : ''
  const href = (path: string) => `${prefix}${path}` as Route
  async function logout() { setLoading(true); await createClient().auth.signOut(); router.push(href('/')); router.refresh() }
  if (!userEmail) return <div style={{ display: 'flex', gap: 8 }}><Link className="btn btn-secondary" href={href('/auth/sign-in')}><UserRound size={15} /> {t.signIn}</Link><Link className="btn btn-primary" href={href('/auth/sign-up')}>{t.getStarted}</Link></div>
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}><Link className="btn btn-secondary" href={href('/favorites')}><Bookmark size={15} /> {t.favorites}</Link><Link className="btn btn-secondary" href={href('/collections')}><FolderHeart size={15} /> {t.collections}</Link><Link className="btn btn-secondary" href={href('/dashboard')}><LayoutDashboard size={15} /> {t.dashboard}</Link>{role === 'admin' && <Link className="btn btn-secondary" href={href('/admin')}><Shield size={15} /> {t.admin}</Link>}<button className="btn btn-secondary" onClick={logout} disabled={loading}><LogOut size={15} />{loading ? t.signingOut : t.logout}</button></div>
}
