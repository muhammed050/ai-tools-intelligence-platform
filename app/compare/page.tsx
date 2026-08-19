import type { Metadata } from 'next'
import { GitCompareArrows } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ComparePicker } from '@/components/compare-picker'

export const metadata: Metadata = { title: 'Compare AI Tools', description: 'Compare two to four AI tools by pricing, ratings, capabilities, platforms and best use cases.', alternates: { canonical: '/compare' } }

type SearchParams = { tool?: string | string[] }

export default async function Compare({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const initialSlug = Array.isArray(params.tool) ? params.tool[0] : params.tool
  let data: any[] = []
  try {
    const db = await createClient()
    const result = await db.from('tools').select('id,name,slug,short_description,rating,pricing_type').eq('status', 'published').order('featured', { ascending: false }).order('rating', { ascending: false, nullsFirst: false }).limit(100)
    data = result.data || []
  } catch (error) {
    console.error('Comparison directory unavailable', error)
  }
  return <main className="container" style={{ padding: '58px 0 100px' }}><div style={{ maxWidth: 760, marginBottom: 30 }}><div className="tool-logo"><GitCompareArrows size={22} /></div><div className="eyebrow" style={{ marginTop: 18 }}>Make a better choice</div><h1 style={{ fontSize: 48, letterSpacing: '-.045em', margin: '7px 0 10px' }}>Compare AI tools side by side</h1><p className="muted" style={{ fontSize: 18 }}>Select two to four published tools to compare verified pricing, ratings, features, platforms, strengths and limitations.</p></div><ComparePicker tools={data || []} initialSlug={initialSlug} /></main>
}
