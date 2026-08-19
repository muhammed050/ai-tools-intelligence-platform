import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({ tool_id: z.string().uuid() })

async function getContext() { const db = await createClient(); const { data: { user } } = await db.auth.getUser(); return { db, user } }

export async function GET(request: Request) {
  const { db, user } = await getContext()
  const parsed = schema.safeParse({ tool_id: new URL(request.url).searchParams.get('tool_id') })
  if (!parsed.success) return NextResponse.json({ saved: false })
  if (!user) return NextResponse.json({ saved: false })
  const { data, error } = await db.from('favorites').select('tool_id').eq('user_id', user.id).eq('tool_id', parsed.data.tool_id).maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to read favorite state' }, { status: 503 })
  return NextResponse.json({ saved: Boolean(data) })
}

export async function POST(request: Request) {
  const { db, user } = await getContext()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  try { const { tool_id } = schema.parse(await request.json()); const { error } = await db.from('favorites').upsert({ user_id: user.id, tool_id }); if (error) throw error; return NextResponse.json({ saved: true }) } catch { return NextResponse.json({ error: 'Unable to save tool' }, { status: 400 }) }
}

export async function DELETE(request: Request) {
  const { db, user } = await getContext()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  try { const { tool_id } = schema.parse(await request.json()); const { error } = await db.from('favorites').delete().eq('user_id', user.id).eq('tool_id', tool_id); if (error) throw error; return NextResponse.json({ saved: false }) } catch { return NextResponse.json({ error: 'Unable to remove tool' }, { status: 400 }) }
}
