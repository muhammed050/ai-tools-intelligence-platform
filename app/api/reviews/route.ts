import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const toolSchema = z.string().uuid()
const schema = z.object({ tool_id: z.string().uuid(), rating: z.number().int().min(1).max(5), title: z.string().trim().min(3).max(120), body: z.string().trim().min(10).max(4000), pros: z.array(z.string().trim().max(200)).max(10).default([]), cons: z.array(z.string().trim().max(200)).max(10).default([]) })

export async function GET(request: Request) {
  const toolId = toolSchema.safeParse(new URL(request.url).searchParams.get('tool_id'))
  if (!toolId.success) return NextResponse.json({ reviews: [] })
  const db = await createClient()
  const { data, error } = await db.from('reviews').select('id,rating,title,body,pros,cons,created_at').eq('tool_id', toolId.data).eq('status', 'approved').order('created_at', { ascending: false }).limit(20)
  if (error) return NextResponse.json({ error: 'Unable to load reviews' }, { status: 503 })
  return NextResponse.json({ reviews: data || [] }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json())
    const db = await createClient()
    const { data: { user } } = await db.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    const { error } = await db.from('reviews').insert({ ...input, user_id: user.id, status: 'pending' })
    if (error) return NextResponse.json({ error: error.message.includes('already reviewed') ? 'You already reviewed this tool.' : 'Unable to submit review.' }, { status: 400 })
    return NextResponse.json({ ok: true, status: 'pending' })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Please provide a rating, title and useful review.' }, { status: 400 })
    return NextResponse.json({ error: 'Unable to submit review' }, { status: 500 })
  }
}
