import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireEditor } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const updateSchema = z.object({ id: z.string().uuid(), status: z.enum(['pending', 'in_review', 'approved', 'rejected']), admin_notes: z.string().max(4000).nullable().optional() })

export async function GET() {
  try { await requireEditor(); const db = await createClient(); const { data, error } = await db.from('tool_submissions').select('id,name,website_url,description,pricing_type,status,admin_notes,created_at,category:categories(name),submitter_id').order('created_at', { ascending: false }).limit(100); if (error) throw error; return NextResponse.json({ submissions: data || [] }) } catch { return NextResponse.json({ error: 'Unable to load submissions' }, { status: 403 }) }
}

export async function PATCH(request: Request) {
  try { const { user } = await requireEditor(); const input = updateSchema.parse(await request.json()); const db = await createClient(); const { data, error } = await db.from('tool_submissions').update({ status: input.status, admin_notes: input.admin_notes || null, reviewed_by: user.id, reviewed_at: input.status === 'approved' || input.status === 'rejected' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('id', input.id).select('id,status').single(); if (error) throw error; return NextResponse.json({ submission: data }) } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid moderation update' }, { status: 400 }); return NextResponse.json({ error: 'Unable to update submission' }, { status: 403 }) }
}
