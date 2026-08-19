import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const oauthErrors = new Set(['access_denied', 'invalid_request', 'missing_code', 'exchange_failed', 'session_missing'])

function signInRedirect(request: Request, error: string) {
  const url = new URL('/auth/sign-in', request.url)
  url.searchParams.set('error', oauthErrors.has(error) ? error : 'oauth_failed')
  return NextResponse.redirect(url)
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const providerError = requestUrl.searchParams.get('error')
  if (providerError) return signInRedirect(request, providerError)
  const code = requestUrl.searchParams.get('code')
  if (!code) return signInRedirect(request, 'missing_code')
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return signInRedirect(request, 'exchange_failed')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return signInRedirect(request, 'session_missing')
    const next = requestUrl.searchParams.get('next')
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
    return NextResponse.redirect(new URL(safeNext, request.url))
  } catch {
    return signInRedirect(request, 'exchange_failed')
  }
}
