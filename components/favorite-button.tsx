'use client'

import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { AddToCollectionButton } from './add-to-collection-button'

export function FavoriteButton({ toolId }: { toolId: string }) {
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => { fetch(`/api/favorites?tool_id=${encodeURIComponent(toolId)}`).then((response) => response.ok ? response.json() : null).then((data) => { if (data) setSaved(Boolean(data.saved)) }).catch(() => undefined) }, [toolId])
  async function toggle() { setBusy(true); try { const response = await fetch('/api/favorites', { method: saved ? 'DELETE' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tool_id: toolId }) }); if (response.status === 401) { window.location.href = `/auth/sign-in?next=${encodeURIComponent(window.location.pathname)}`; return }; const data = await response.json(); if (response.ok) setSaved(Boolean(data.saved)) } finally { setBusy(false) } }
  return <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}><button type="button" className="btn btn-secondary" onClick={toggle} disabled={busy} aria-pressed={saved} aria-label={saved ? 'Remove tool from favorites' : 'Save tool to favorites'}>{saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}{saved ? 'Saved' : 'Save'}</button><AddToCollectionButton toolId={toolId} /></span>
}
