'use client'

import { useState } from 'react'

export function ReviewForm({ toolId }: { toolId: string }) {
  const [rating, setRating] = useState('5')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setMessage(''); try { const response = await fetch('/api/reviews', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tool_id: toolId, rating: Number(rating), title, body, pros: [], cons: [] }) }); const data = await response.json(); if (response.status === 401) { window.location.href = `/auth/sign-in?next=${encodeURIComponent(window.location.pathname)}`; return }; setMessage(response.ok ? 'Thanks. Your review is pending editorial approval.' : data.error || 'Unable to submit review.') } finally { setBusy(false) } }
  return <form onSubmit={submit} className="card" style={{ padding: 24, display: 'grid', gap: 14 }}><h3 style={{ margin: 0 }}>Share your experience</h3><label>Rating<select value={rating} onChange={(event) => setRating(event.target.value)}><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Limited</option><option value="1">1 — Poor</option></select></label><label>Review title<input value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={120} required /></label><label>Your review<textarea value={body} onChange={(event) => setBody(event.target.value)} minLength={10} maxLength={4000} rows={5} required /></label><button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Submitting...' : 'Submit for review'}</button>{message && <p className="muted" role="status">{message}</p>}</form>
}
