'use client'

import { createClient } from '@/lib/supabase/browser'
import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'

const schema = z.object({ fullName: z.string().trim().min(2).max(80), email: z.string().trim().email(), password: z.string().min(8).max(72), confirm: z.string() }).refine(v => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match.' })

export default function SignUp() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [loading, setLoading] = useState(false); const [googleLoading, setGoogleLoading] = useState(false)
  const set = (key: keyof typeof form, value: string) => setForm(v => ({ ...v, [key]: value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess(''); const parsed = schema.safeParse(form)
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Please check your details.'); return }
    setLoading(true)
    try {
      const { data, error } = await createClient().auth.signUp({ email: form.email.trim(), password: form.password, options: { data: { full_name: form.fullName.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` } })
      if (error) { setError(error.message.includes('already registered') ? 'Email already exists. Try signing in.' : 'Unable to create your account. Please check your details and try again.'); return }
      if (data.session) window.location.assign('/dashboard')
      else setSuccess('Account created. Check your email to confirm your address.')
    } catch (err) { console.error('Account creation failed', err); setError('Unable to create your account. Please try again.') }
    finally { setLoading(false) }
  }

  async function google() {
    setError(''); setGoogleLoading(true)
    try {
      const { error } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
      if (error) setError('Google sign-up is unavailable right now. Please try email sign-up.')
    } catch (err) { console.error('Google sign-up failed', err); setError('Google sign-up is unavailable right now. Please try email sign-up.') }
    finally { setGoogleLoading(false) }
  }

  return <main className="container" style={{ minHeight: 'calc(100vh - 68px)', display: 'grid', placeItems: 'center', padding: '48px 0' }}><section className="card" style={{ width: 'min(100%, 500px)', padding: 32, boxShadow: '0 24px 80px rgba(0,0,0,.28)' }}><span className="muted">Start your AI toolkit</span><h1 style={{ fontSize: 34, margin: '8px 0' }}>Create your account</h1><p className="muted">Save discoveries, build comparisons and keep your favorite tools in one place.</p><button type="button" className="btn btn-secondary" onClick={google} disabled={googleLoading || loading} style={{ width: '100%', margin: '18px 0' }}>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</button><div className="muted" style={{ textAlign: 'center', marginBottom: 18 }}>or use email</div><form onSubmit={submit} style={{ display: 'grid', gap: 15 }}><label>Full name<input value={form.fullName} onChange={e => set('fullName', e.target.value)} autoComplete="name" required /></label><label>Email<input value={form.email} onChange={e => set('email', e.target.value)} type="email" autoComplete="email" required /></label><label>Password<input value={form.password} onChange={e => set('password', e.target.value)} type="password" autoComplete="new-password" required minLength={8} /></label><label>Confirm password<input value={form.confirm} onChange={e => set('confirm', e.target.value)} type="password" autoComplete="new-password" required /></label>{error&&<p role="alert" style={{color:'#fb7185',margin:0}}>{error}</p>}{success&&<p role="status" style={{color:'#4ade80',margin:0}}>{success}</p>}<button type="submit" className="btn btn-primary" disabled={loading || googleLoading} style={{width:'100%'}}>{loading?'Creating account...':'Create account'}</button></form><p className="muted" style={{textAlign:'center',marginTop:22}}>Already have an account? <Link href="/auth/sign-in" style={{color:'#9b8cff',fontWeight:700}}>Sign in</Link></p></section></main>
}
