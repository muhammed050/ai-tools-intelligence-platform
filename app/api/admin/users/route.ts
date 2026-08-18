import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (error) throw error
    const { data: profiles, error: profileError } = await admin.from('profiles').select('id,full_name,display_name,role,created_at')
    if (profileError) throw profileError
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))
    return NextResponse.json({ users: data.users.map((u) => ({ id: u.id, email: u.email, full_name: profileMap.get(u.id)?.full_name ?? profileMap.get(u.id)?.display_name ?? u.user_metadata?.full_name ?? u.user_metadata?.name ?? '', role: profileMap.get(u.id)?.role ?? 'user', created_at: u.created_at, confirmed: Boolean(u.email_confirmed_at) })) })
  } catch {
    return NextResponse.json({ error: 'Unable to load users' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    const body = await request.json()
    const allowed = ['user', 'editor', 'tool_owner', 'admin']
    if (typeof body?.userId !== 'string' || !allowed.includes(body?.role) || body.userId === user.id) return NextResponse.json({ error: 'Invalid role change' }, { status: 400 })
    const { error } = await supabase.rpc('set_user_role', { target_user: body.userId, new_role: body.role })
    if (error) return NextResponse.json({ error: 'Unable to change role' }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unable to change role' }, { status: 500 })
  }
}
