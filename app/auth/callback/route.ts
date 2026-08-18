import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/auth/sign-in?error=oauth_failed', request.url))
  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(new URL('/auth/sign-in?error=oauth_failed', request.url))
  const next = requestUrl.searchParams.get('next')
  return NextResponse.redirect(new URL(next?.startsWith('/') ? next : '/dashboard', request.url))
}
