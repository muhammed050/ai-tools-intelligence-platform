'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Bookmark, FolderHeart, LayoutDashboard, LogOut, Shield, UserRound } from 'lucide-react'

export function AuthNavMain({ userEmail, role }: { userEmail?: string | null; role?: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function logout() { setLoading(true); await createClient().auth.signOut(); router.push('/'); router.refresh() }
  if (!userEmail) return <div style={{ display: 'flex', gap: 8 }}><Link className="btn btn-secondary" href="/auth/sign-in"><UserRound size={15} /> Sign In</Link><Link className="btn btn-primary" href="/auth/sign-up">Get Started</Link></div>
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}><Link className="btn btn-secondary" href="/favorites"><Bookmark size={15} /> Favorites</Link><Link className="btn btn-secondary" href="/collections"><FolderHeart size={15} /> Collections</Link><Link className="btn btn-secondary" href="/dashboard"><LayoutDashboard size={15} /> Dashboard</Link>{role === 'admin' && <Link className="btn btn-secondary" href="/admin"><Shield size={15} /> Admin</Link>}<button className="btn btn-secondary" onClick={logout} disabled={loading}><LogOut size={15} />{loading ? 'Signing out...' : 'Logout'}</button></div>
}
