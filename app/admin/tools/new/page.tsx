'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string }

type ToolForm = {
  name: string
  slug: string
  website_url: string
  short_description: string
  description: string
  category_id: string
  pricing_type: string
  starting_price: string
  currency: string
  logo_url: string
  source_url: string
  verified: boolean
  featured: boolean
  status: string
}

export default function NewTool() {
  const [cats, setCats] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')
  const [f, setF] = useState<ToolForm>({
    name: '', slug: '', website_url: '', short_description: '', description: '',
    category_id: '', pricing_type: 'freemium', starting_price: '', currency: 'USD',
    logo_url: '', source_url: '', verified: false, featured: false, status: 'draft'
  })
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        setCategoriesLoading(true)
        setCategoriesError('')
        const response = await fetch('/api/admin/categories')
        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.error || 'Failed to load categories')
        const categories = Array.isArray(data) ? data : data?.categories
        if (!Array.isArray(categories)) throw new Error('Invalid categories response')
        if (!cancelled) setCats(categories)
      } catch (err) {
        if (!cancelled) {
          setCats([])
          setCategoriesError(err instanceof Error ? err.message : 'Failed to load categories')
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false)
      }
    }

    loadCategories()
    return () => { cancelled = true }
  }, [])

  const set = (k: keyof ToolForm, v: string | boolean) => setF(x => ({ ...x, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const r = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...f,
          starting_price: f.starting_price ? Number(f.starting_price) : null,
          logo_url: f.logo_url || null,
          source_url: f.source_url || null
        })
      })
      const data = await r.json().catch(() => null)
      if (!r.ok) {
        setError(data?.error || 'Unable to create tool')
        return
      }
      router.push('/admin/tools')
    } catch {
      setError('Unable to connect to the server. Please try again.')
    }
  }

  return (
    <main className="container" style={{ padding: '55px 0' }}>
      <form onSubmit={submit} className="card" style={{ padding: 28, maxWidth: 900, margin: 'auto' }}>
        <h1>Add AI tool</h1>
        <p className="muted">Create as draft, then publish after review.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            ['name', 'Tool name'], ['slug', 'Slug'], ['website_url', 'Website URL'],
            ['short_description', 'Short description'], ['logo_url', 'Logo URL'],
            ['source_url', 'Source URL'], ['starting_price', 'Starting price'], ['currency', 'Currency']
          ].map(([k, l]) => (
            <label key={k}>{l}
              <input
                value={f[k as keyof ToolForm] as string}
                onChange={e => set(k as keyof ToolForm, e.target.value)}
                required={['name', 'slug', 'website_url', 'short_description'].includes(k)}
              />
            </label>
          ))}

          <label>Category
            <select value={f.category_id} onChange={e => set('category_id', e.target.value)} required disabled={categoriesLoading || cats.length === 0}>
              <option value="">{categoriesLoading ? 'Loading categories…' : cats.length ? 'Select category' : 'No categories available'}</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {categoriesError && <small style={{ color: '#fb7185' }}>Could not load categories: {categoriesError}</small>}
          </label>

          <label>Pricing
            <select value={f.pricing_type} onChange={e => set('pricing_type', e.target.value)}>
              {['free', 'freemium', 'paid', 'free_trial', 'contact_sales'].map(x => <option key={x}>{x}</option>)}
            </select>
          </label>

          <label style={{ gridColumn: '1/-1' }}>Full description
            <textarea rows={8} value={f.description} onChange={e => set('description', e.target.value)} required />
          </label>
        </div>

        {error && <p style={{ color: '#fb7185' }}>{error}</p>}
        <button className="btn btn-primary" style={{ marginTop: 20 }} disabled={categoriesLoading || cats.length === 0}>
          Create tool
        </button>
      </form>
    </main>
  )
}
