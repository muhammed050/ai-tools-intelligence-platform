'use client'

import { useState } from 'react'

type Result = { total: number; imported: number; rows: { row: number; errors: string[]; warnings: string[] }[] }

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null); const [result, setResult] = useState<Result | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(mode: 'validate' | 'import') {
    if (!file) { setError('Choose a CSV, XLSX, or JSON file first.'); return }
    setLoading(true); setError(''); const form = new FormData(); form.set('file', file); form.set('mode', mode)
    try { const response = await fetch('/api/admin/tools/import', { method: 'POST', body: form }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setResult(payload) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Import failed') } finally { setLoading(false) }
  }
  const invalid = result?.rows.filter((row) => row.errors.length) ?? []
  return <main className="container" style={{ padding: '55px 0 100px', maxWidth: 980 }}><div className="eyebrow">Catalog operations</div><h1>Bulk tool import</h1><p className="muted">Upload CSV, XLSX, or JSON. Eldevo validates each row, detects existing slugs and websites, and imports only valid rows.</p><section className="card" style={{ padding: 24, display: 'grid', gap: 16 }}><label>Import file<input type="file" accept=".csv,.xlsx,.json,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setResult(null) }} /></label><small className="muted">Maximum 5 MB / 1,000 rows. Required columns: name, slug, description, tagline, website_url, category.</small><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="btn btn-secondary" disabled={loading} onClick={() => submit('validate')}>{loading ? 'Processing…' : 'Validate and preview'}</button><button className="btn btn-primary" disabled={loading || !result || invalid.length > 0} onClick={() => submit('import')}>Import valid rows</button><a className="btn btn-secondary" href="/api/admin/tools/export?format=csv">Export CSV</a><a className="btn btn-secondary" href="/api/admin/tools/export?format=xlsx">Export XLSX</a><a className="btn btn-secondary" href="/api/admin/tools/export?format=json">Export JSON</a></div>{error && <p role="alert" style={{ color: '#dc2626', margin: 0 }}>{error}</p>}</section>{result && <section className="card" style={{ padding: 24, marginTop: 18 }}><h2 style={{ marginTop: 0 }}>Import report</h2><p>{result.total} rows reviewed · {result.imported} imported · {invalid.length} need correction</p>{invalid.length > 0 && <ul>{invalid.slice(0, 50).map((row) => <li key={row.row}>Row {row.row}: {row.errors.join(', ')}</li>)}</ul>}{result.rows.some((row) => row.warnings.length) && <p className="muted">Formula-like spreadsheet values were treated as plain text.</p>}</section>}</main>
}
