'use client'

import { useState } from 'react'
import { ArrowRight, Check, GitCompareArrows } from 'lucide-react'

type Tool = { id: string; name: string; slug: string; short_description: string | null; rating: number | null; pricing_type: string | null }

export function ComparePicker({ tools, initialSlug }: { tools: Tool[]; initialSlug?: string }) {
  const [selected, setSelected] = useState<string[]>(initialSlug ? [initialSlug] : [])
  const toggle = (slug: string) => setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length >= 4 ? current : [...current, slug])
  const compare = () => { if (selected.length < 2) return; window.location.href = `/compare/${selected.join('-vs-')}` }
  return <div><div className="compare-toolbar"><span className="muted">{selected.length} of 2–4 tools selected</span><button className="btn btn-primary" type="button" onClick={compare} disabled={selected.length < 2}><GitCompareArrows size={16} /> Compare selected <ArrowRight size={15} /></button></div><div className="tool-grid">{tools.map((tool) => { const isSelected = selected.includes(tool.slug); return <button type="button" className={`card tool-card compare-option${isSelected ? ' is-selected' : ''}`} key={tool.id} onClick={() => toggle(tool.slug)} aria-pressed={isSelected}><span className="compare-check">{isSelected && <Check size={14} />}</span><h2 style={{ margin: '12px 0 5px', textAlign: 'left' }}>{tool.name}</h2><p className="muted" style={{ margin: 0, textAlign: 'left' }}>{tool.short_description || 'Explore this AI tool in the directory.'}</p><div className="muted" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 13 }}><span>★ {tool.rating ?? 'Unrated'}</span><span>{tool.pricing_type || 'Pricing unknown'}</span></div></button> })}</div></div>
}
