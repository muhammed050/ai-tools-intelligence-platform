import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({ name: z.string().trim().min(2).max(120), website_url: z.string().url().max(500), description: z.string().trim().min(30).max(4000), category_id: z.string().uuid().nullable().optional(), pricing_type: z.string().trim().max(40).nullable().optional(), features: z.array(z.string().trim().min(1).max(100)).max(30).default([]), logo_url: z.string().url().max(500).nullable().optional(), use_cases: z.array(z.string().trim().min(1).max(160)).max(20).default([]) })

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json())
    const db = await createClient()
    const { data: { user } } = await db.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in required to submit a tool.' }, { status: 401 })
    const { data, error } = await db.from('tool_submissions').insert({ ...input, contact_email: user.email || '', submitter_id: user.id, status: 'pending' }).select('id,status').single()
    if (error) throw error
    return NextResponse.json({ submission: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Please complete the required fields with valid information.' }, { status: 400 })
    console.error('Tool submission failed', error)
    return NextResponse.json({ error: 'Unable to submit this tool right now.' }, { status: 500 })
  }
}
