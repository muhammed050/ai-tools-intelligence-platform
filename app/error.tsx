'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Unhandled application error', error) }, [error])
  return <main className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '60px 0' }}><section className="card directory-empty"><div className="eyebrow">Something went wrong</div><h1>We could not load this page.</h1><p className="muted">Please try again. Your account and saved data are unchanged.</p><button className="btn btn-primary" type="button" onClick={() => reset()}>Try again</button></section></main>
}