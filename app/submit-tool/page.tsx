import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SubmissionForm } from '@/components/submission-form'

export const metadata: Metadata = { title: 'Submit an AI Tool', description: 'Suggest an AI tool for editorial review by the AITools directory team.' }

export default async function SubmitTool() {
  const db = await createClient()
  const { data: categories } = await db.from('categories').select('id,name').order('name')
  return <main className="container" style={{ padding: '58px 0 100px', maxWidth: 820 }}><div className="eyebrow">Directory submissions</div><h1>Submit an AI tool</h1><p className="muted" style={{ fontSize: 18 }}>Share the details our editors need to evaluate a new listing. You will need an account so you can track ownership and we can follow up.</p><SubmissionForm categories={categories || []} /></main>
}
