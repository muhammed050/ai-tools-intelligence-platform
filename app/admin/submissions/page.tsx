import { redirect } from 'next/navigation'
import { requireEditor } from '@/lib/auth'
import { ModerationQueue } from '@/components/moderation-queue'

export default async function AdminSubmissions() { try { await requireEditor() } catch { redirect('/auth/sign-in') } return <main className="container" style={{ padding: '55px 0 100px' }}><div className="eyebrow">Editorial workflow</div><h1>Tool submissions</h1><p className="muted">Review submitted tools before they enter the public directory.</p><ModerationQueue type="submissions" /></main> }
