'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, LogIn, LogOut, UserRound } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'

export function AuthNavMain({ userEmail, role, locale = 'en' }: { userEmail?: string | null; role?: string | null; locale?: 'en' | 'ar' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const t = getDictionary(locale).auth
  const href = (path: string) => path as Route

  async function logout() {
    setLoading(true)
    await createClient().auth.signOut()
    setOpen(false)
    router.push(href('/'))
    router.refresh()
  }

  if (!userEmail) return <Link className="header-login" href={href('/auth/sign-in')}><LogIn size={16} /> <span>{t.signIn}</span></Link>

  return <div className="account-menu"><button type="button" className="account-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu"><span className="account-avatar"><UserRound size={15} /></span><span className="account-email">{userEmail.split('@')[0]}</span><ChevronDown size={15} /></button>{open && <div className="account-dropdown" role="menu"><div className="account-email-full">{userEmail}</div><Link href={href('/dashboard')} onClick={() => setOpen(false)} role="menuitem">{t.dashboard}</Link><Link href={href('/favorites')} onClick={() => setOpen(false)} role="menuitem">{t.favorites}</Link><Link href={href('/collections')} onClick={() => setOpen(false)} role="menuitem">{t.collections}</Link>{role === 'admin' && <Link href={href('/admin')} onClick={() => setOpen(false)} role="menuitem">{t.admin}</Link>}<button type="button" onClick={logout} disabled={loading} role="menuitem"><LogOut size={15} /> {loading ? t.signingOut : t.logout}</button></div>}</div>
}
