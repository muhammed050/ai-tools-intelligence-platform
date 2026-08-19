import { redirect } from 'next/navigation'
import { requireEditor } from '@/lib/auth'
import { ModerationQueue } from '@/components/moderation-queue'

export default async function AdminReviews() { try { await requireEditor() } catch { redirect('/auth/sign-in') } return <main className="container" style={{ padding: '55px 0 100px' }}><div className="eyebrow">Editorial workflow</div><h1>Review moderation</h1><p className="muted">Approve useful reviews and flag content that does not meet the editorial standard.</p><ModerationQueue type="reviews" /></main> }
