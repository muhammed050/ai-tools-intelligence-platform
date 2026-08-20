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
      } catch (error) {
        if ((error as Error).name !== 'AbortError') console.error(error)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
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

  return <div ref={wrapper} className="global-search">
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
}
