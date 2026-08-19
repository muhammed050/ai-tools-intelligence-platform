'use client'

import { useEffect, useState } from 'react'

type QueueType = 'submissions' | 'reviews'
type Item = { id: string; name?: string; title?: string; description?: string; body?: string; status: string; website_url?: string; rating?: number; tool?: { name: string; slug: string } | { name: string; slug: string }[] }
export function ModerationQueue({ type }: { type: QueueType }) {
  const [items, setItems] = useState<Item[]>([])
  const [message, setMessage] = useState('')
  const endpoint = `/api/admin/${type}`
  async function load() { const response = await fetch(endpoint, { cache: 'no-store' }); const data = await response.json(); if (response.ok) setItems(type === 'submissions' ? data.submissions : data.reviews); else setMessage(data.error || 'Unable to load queue') }
  useEffect(() => { load() }, [])
  async function update(item: Item, status: string) { const response = await fetch(endpoint, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.id, status }) }); if (response.ok) await load(); else setMessage('Unable to update item') }
  return <div>{message && <p role="alert" style={{ color: '#fb7185' }}>{message}</p>}<div style={{ display: 'grid', gap: 14, marginTop: 24 }}>{items.length === 0 ? <div className="card" style={{ padding: 24 }}><p className="muted">No items in this queue.</p></div> : items.map((item) => <article className="card" style={{ padding: 22 }} key={item.id}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}><div><div className="eyebrow">{type === 'submissions' ? 'Tool submission' : `Review for ${Array.isArray(item.tool) ? item.tool[0]?.name : item.tool?.name || 'tool'}`}</div><h2 style={{ margin: '5px 0' }}>{item.name || item.title}</h2><p className="muted">{item.description || item.body}</p>{item.website_url && <a href={item.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#b9c5ff' }}>{item.website_url}</a>}{item.rating && <p>Rating: {item.rating}/5</p>}</div><div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}><span className="badge">{item.status}</span><select value={item.status} onChange={(event) => update(item, event.target.value)} aria-label={`Change status for ${item.name || item.title}`}><option value="pending">Pending</option><option value="in_review">In review</option><option value="approved">Approved</option><option value="rejected">Rejected</option>{type === 'reviews' && <option value="flagged">Flagged</option>}</select></div></div></article>)}</div></div>
}
