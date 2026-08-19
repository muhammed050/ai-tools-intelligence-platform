import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireEditor } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const updateSchema = z.object({ id: z.string().uuid(), status: z.enum(['pending', 'approved', 'rejected', 'flagged']) })

export async function GET() { try { await requireEditor(); const db = await createClient(); const { data, error } = await db.from('reviews').select('id,tool_id,rating,title,body,status,created_at,tool:tools(name,slug)').order('created_at', { ascending: false }).limit(100); if (error) throw error; return NextResponse.json({ reviews: data || [] }) } catch { return NextResponse.json({ error: 'Unable to load reviews' }, { status: 403 }) } }

export async function PATCH(request: Request) { try { await requireEditor(); const input = updateSchema.parse(await request.json()); const db = await createClient(); const { data, error } = await db.from('reviews').update({ status: input.status, updated_at: new Date().toISOString() }).eq('id', input.id).select('id,status').single(); if (error) throw error; return NextResponse.json({ review: data }) } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid review moderation update' }, { status: 400 }); return NextResponse.json({ error: 'Unable to update review' }, { status: 403 }) } }
