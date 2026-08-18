'use client'

import { createClient } from '@/lib/supabase/browser'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function messageFor(error: string) {
  if (error.includes('Invalid login credentials')) return 'Invalid email or password.'
  if (error.includes('Email not confirmed')) return 'Please confirm your email before signing in.'
  return 'Unable to sign in. Please check your details and try again.'
}

export default function SignIn() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) { setError(messageFor(error.message)); return }
    const next = params.get('next')
    router.push(next && next.startsWith('/') ? (next as never) : '/dashboard')
    router.refresh()
  }

  async function google() {
    setError(''); setGoogleLoading(true)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    if (error) { setGoogleLoading(false); setError('Google login failed. Please try again.') }
  }

  return <main className="container" style={{ minHeight: 'calc(100vh - 68px)', display: 'grid', placeItems: 'center', padding: '48px 0' }}>
    <section className="card" style={{ width: 'min(100%, 480px)', padding: 32, boxShadow: '0 24px 80px rgba(0,0,0,.28)' }}>
      <div style={{ marginBottom: 26 }}><span className="muted">AI Tools Intelligence</span><h1 style={{ fontSize: 34, margin: '8px 0' }}>Welcome back</h1><p className="muted">Sign in to save tools, compare options and personalize your AI discovery.</p></div>
      <button type="button" className="btn btn-secondary" onClick={google} disabled={googleLoading || loading} style={{ width: '100%', gap: 10, marginBottom: 18 }}>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</button>
      <div className="muted" style={{ textAlign: 'center', marginBottom: 18 }}>or continue with email</div>
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" required placeholder="••••••••" /></label>
        <div style={{ textAlign: 'right' }}><Link className="muted" href="/auth/forgot-password">Forgot password?</Link></div>
        {error && <p role="alert" style={{ color: '#fb7185', margin: 0 }}>{error}</p>}
        <button className="btn btn-primary" disabled={loading || googleLoading} style={{ width: '100%' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <p className="muted" style={{ textAlign: 'center', marginTop: 22 }}>New here? <Link href="/auth/sign-up" style={{ color: '#9b8cff', fontWeight: 700 }}>Create an account</Link></p>
    </section>
  </main>
}
