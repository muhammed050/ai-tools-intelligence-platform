'use client'

import Link from 'next/link'
import { FileText, Grid2X2, Search, Wrench, X } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

type Results = { tools: { name: string; slug: string; short_description: string | null }[]; categories: { name: string; slug: string; description: string | null }[]; articles: { title: string; slug: string; excerpt: string | null }[] }
const emptyResults: Results = { tools: [], categories: [], articles: [] }
type Suggestion = { href: string; title: string; description: string | null; kind: 'Tool' | 'Category' | 'Guide' }

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Results>(emptyResults)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [loading, setLoading] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) { setResults(emptyResults); setLoading(false); return }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        if (response.ok) { setResults(await response.json()); setActive(-1) }
      } catch (error) { if ((error as Error).name !== 'AbortError') console.error(error) }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }, 180)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query])

  useEffect(() => {
    const close = (event: MouseEvent) => { if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); inputRef.current?.focus(); setOpen(true) }
    }
    document.addEventListener('keydown', shortcut)
    return () => document.removeEventListener('keydown', shortcut)
  }, [])

  const suggestions = useMemo<Suggestion[]>(() => [
    ...results.tools.map((item) => ({ href: `/tools/${item.slug}`, title: item.name, description: item.short_description, kind: 'Tool' as const })),
    ...results.categories.map((item) => ({ href: `/categories/${item.slug}`, title: item.name, description: item.description, kind: 'Category' as const })),
    ...results.articles.map((item) => ({ href: `/blog/${item.slug}`, title: item.title, description: item.excerpt, kind: 'Guide' as const }))
  ], [results])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (active >= 0 && suggestions[active]) { window.location.href = suggestions[active].href; return }
    if (query.trim()) window.location.href = `/tools?q=${encodeURIComponent(query.trim())}`
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((current) => Math.min(current + 1, suggestions.length - 1)) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((current) => Math.max(current - 1, -1)) }
    else if (event.key === 'Escape') { setOpen(false); setActive(-1); inputRef.current?.blur() }
  }

  return <>
    <div ref={wrapper} className="global-search">
      <form onSubmit={submit} role="search" className="global-search-form">
        <span className="global-search-icon"><Search size={18} aria-hidden="true" /></span>
        <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true) }} onFocus={() => setOpen(true)} onKeyDown={onKeyDown} placeholder="Search AI tools, categories, guides..." aria-label="Search tools, categories and guides" aria-controls="global-search-results" aria-activedescendant={active >= 0 ? `search-result-${active}` : undefined} />
        {query && <button type="button" className="global-search-clear" onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }} aria-label="Clear search"><X size={15} /></button>}
        <button type="submit" className="global-search-submit" aria-label="Search directory"><Search size={15} /><span>Search</span></button>
        <kbd className="global-search-shortcut">⌘ K</kbd>
      </form>
      {open && query.trim().length >= 2 && <div id="global-search-results" role="listbox" aria-label="Search suggestions" className="search-results">
        <div className="search-results-header"><span>Search results</span>{loading ? <span className="search-loading">Searching…</span> : <span>Enter to view all</span>}</div>
        {loading && !suggestions.length ? <div className="search-loading-row"><span /><span /><span /></div> : !suggestions.length ? <p className="muted search-empty">No matches yet. Press Enter to search the directory.</p> : suggestions.map((suggestion, index) => <Link id={`search-result-${index}`} role="option" aria-selected={active === index} href={suggestion.href} key={`${suggestion.kind}-${suggestion.href}`} onMouseEnter={() => setActive(index)} onClick={() => setOpen(false)}>
          <span className="search-result-kind">{suggestion.kind === 'Tool' ? <Wrench size={13} /> : suggestion.kind === 'Category' ? <Grid2X2 size={13} /> : <FileText size={13} />}</span>
          <span className="search-result-copy"><strong>{suggestion.title}</strong><span>{suggestion.description}</span></span>
          <span className="search-result-arrow">↵</span>
        </Link>)}
      </div>}
    </div>
    <style jsx global>{`
      .global-search { position:relative; flex:0 1 390px; min-width:220px; }
      .global-search-form { position:relative; display:flex; align-items:center; min-height:46px; padding:0 7px 0 14px; border:1px solid #dbe3ef; border-radius:14px; background:rgba(248,250,252,.96); color:#64748b; box-shadow:0 1px 2px rgba(15,23,42,.03),inset 0 1px 0 rgba(255,255,255,.9); transition:border-color .2s,box-shadow .2s,background .2s; }
      .global-search-form:hover { border-color:#cbd5e1; background:#fff; }
      .global-search-form:focus-within { border-color:#93c5fd; background:#fff; box-shadow:0 0 0 4px rgba(219,234,254,.8),0 10px 28px rgba(37,99,235,.08); }
      .global-search-icon { display:grid; place-items:center; flex:0 0 auto; color:#64748b; }
      .global-search input { min-width:0; flex:1; height:42px; padding:0 9px; border:0!important; outline:0; background:transparent!important; color:#0f172a!important; box-shadow:none!important; font-size:13px; font-weight:550; }
      .global-search input::placeholder { color:#94a3b8; }
      .global-search-clear,.global-search-submit { display:inline-flex; align-items:center; justify-content:center; flex:0 0 auto; border:0; cursor:pointer; }
      .global-search-clear { width:30px; height:30px; margin-right:3px; border-radius:8px; background:transparent; color:#94a3b8; }
      .global-search-clear:hover { background:#f1f5f9; color:#475569; }
      .global-search-submit { gap:5px; min-height:32px; padding:0 10px; border-radius:9px; background:#0f172a; color:#fff; font-size:11px; font-weight:750; box-shadow:0 3px 8px rgba(15,23,42,.12); }
      .global-search-submit:hover { background:#1e293b; }
      .global-search-shortcut { display:inline-flex; align-items:center; justify-content:center; min-width:38px; height:24px; margin-left:7px; padding:0 6px; border:1px solid #dbe3ef; border-bottom-color:#cbd5e1; border-radius:6px; background:#fff; color:#94a3b8; font:600 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace; }
      .search-results { position:absolute; top:calc(100% + 9px); left:0; right:0; overflow:hidden; border:1px solid #dbe3ef; border-radius:16px; background:rgba(255,255,255,.98); box-shadow:0 22px 55px rgba(15,23,42,.16); backdrop-filter:blur(18px); }
      .search-results-header { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px 15px; border-bottom:1px solid #eef2f7; color:#64748b; font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
      .search-loading { color:#2563eb; }
      .search-results>a { display:grid; grid-template-columns:30px minmax(0,1fr) 24px; align-items:center; gap:10px; padding:11px 13px; border-bottom:1px solid #f1f5f9; transition:background .15s; }
      .search-results>a:last-child { border-bottom:0; }
      .search-results>a:hover,.search-results>a[aria-selected="true"] { background:#f8fbff; }
      .search-result-kind { display:grid; place-items:center; width:30px; height:30px; border-radius:9px; background:#eff6ff; color:#2563eb; }
      .search-result-copy { min-width:0; display:grid; gap:1px; }
      .search-result-copy strong { overflow:hidden; color:#0f172a; font-size:13px; text-overflow:ellipsis; white-space:nowrap; }
      .search-result-copy>span { overflow:hidden; color:#64748b; font-size:11px; text-overflow:ellipsis; white-space:nowrap; }
      .search-result-arrow { color:#94a3b8; font-size:13px; text-align:center; }
      .search-empty { margin:0; padding:22px 16px; text-align:center; font-size:12px; }
      .search-loading-row { display:grid; gap:9px; padding:16px; }
      .search-loading-row span { height:9px; border-radius:999px; background:#e2e8f0; animation:search-pulse 1.2s ease-in-out infinite alternate; }
      .search-loading-row span:nth-child(2) { width:78%; } .search-loading-row span:nth-child(3) { width:58%; }
      @keyframes search-pulse { from { opacity:.45; } to { opacity:1; } }
      @media (max-width:1100px) { .global-search { flex:1 1 auto; max-width:500px; margin-left:auto; } }
      @media (max-width:680px) { .global-search { min-width:0; max-width:none; } .global-search-form { min-height:42px; padding-left:11px; } .global-search-shortcut { display:none; } .global-search-submit { width:34px; padding:0; } .global-search-submit span { display:none; } .global-search input { font-size:12px; } .search-results { left:auto; right:-52px; width:min(94vw,390px); } }
    `}</style>
  </>
}
