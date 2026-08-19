'use client'

import { createClient } from '@/lib/supabase/browser'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function messageFor(error: string) {
  if (error.includes('Invalid login credentials')) return 'Invalid email or password.'
  if (error.includes('Email not confirmed')) return 'Please confirm your email before signing in.'
  if (error.includes('authentication is not configured')) return 'Authentication is not configured on this deployment. Please contact the site administrator.'
  return 'Unable to sign in. Please check your details and try again.'
}

function SignInForm() {
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password })
      if (error) { setError(messageFor(error.message)); return }
      const next = params.get('next')
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
      window.location.assign(safeNext)
    } catch (err) {
      setError(messageFor(err instanceof Error ? err.message : 'Authentication failed'))
    } finally { setLoading(false) }
  }

  async function google() {
    setError(''); setGoogleLoading(true)
    try {
      const { error } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
      if (error) setError('Google sign-in is unavailable right now. Please try email sign-in.')
    } catch (err) {
      console.error('Google sign-in failed', err)
      setError('Google sign-in is unavailable right now. Please try email sign-in.')
    } finally { setGoogleLoading(false) }
  }

  return <main className="container" style={{ minHeight: 'calc(100vh - 68px)', display: 'grid', placeItems: 'center', padding: '48px 0' }}>
    <section className="card" style={{ width: 'min(100%, 480px)', padding: 32, boxShadow: '0 24px 80px rgba(0,0,0,.28)' }}>
      <div style={{ marginBottom: 26 }}><span className="muted">Eldevo — AI Tools Intelligence</span><h1 style={{ fontSize: 34, margin: '8px 0' }}>Welcome back</h1><p className="muted">Sign in to save tools, compare options and personalize your AI discovery.</p></div>
      <button type="button" className="btn btn-secondary" onClick={google} disabled={googleLoading || loading} style={{ width: '100%', gap: 10, marginBottom: 18 }}>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</button>
      <div className="muted" style={{ textAlign: 'center', marginBottom: 18 }}>or continue with email</div>
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" required placeholder="••••••••" /></label>
        <div style={{ textAlign: 'right' }}><Link className="muted" href="/auth/forgot-password">Forgot password?</Link></div>
        {error && <p role="alert" style={{ color: '#fb7185', margin: 0 }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading || googleLoading} style={{ width: '100%' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <p className="muted" style={{ textAlign: 'center', marginTop: 22 }}>New here? <Link href="/auth/sign-up" style={{ color: '#9b8cff', fontWeight: 700 }}>Create an account</Link></p>
    </section>
  </main>
}

export default function SignIn() {
  return <Suspense fallback={<main className="container" style={{ minHeight: 'calc(100vh - 68px)', display: 'grid', placeItems: 'center' }}><div className="card" style={{ padding: 32 }}>Loading sign in...</div></main>}><SignInForm /></Suspense>
}
