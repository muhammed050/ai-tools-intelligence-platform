import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { LOCALE_COOKIE, normalizeLocale } from '@/lib/i18n'

export async function updateSession(request: NextRequest) {
  const originalPathname = request.nextUrl.pathname
  const localeMatch = originalPathname.match(/^\/(ar|en)(?=\/|$)/)
  const locale = normalizeLocale(localeMatch?.[1])
  const pathname = originalPathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/'

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-eldevo-locale', locale)

  let response = NextResponse.next({ request: { headers: requestHeaders } })
  response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return localeMatch ? rewriteWithCookies(request, pathname, requestHeaders, response) : response

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request: { headers: requestHeaders } })
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  if ((isDashboard || isAdmin) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = `${locale === 'ar' ? '/ar' : ''}/auth/sign-in`
    url.searchParams.set('next', originalPathname)
    return NextResponse.redirect(url)
  }

  if (user && isAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const adminOnly =
      pathname === '/admin' ||
      pathname.startsWith('/admin/users') ||
      pathname.startsWith('/admin/analytics') ||
      pathname.startsWith('/admin/ai') ||
      pathname.startsWith('/admin/seo')

    const editorArea =
      pathname.startsWith('/admin/tools') ||
      pathname.startsWith('/admin/reviews')

    const allowed = adminOnly
      ? profile?.role === 'admin'
      : editorArea
        ? ['admin', 'editor'].includes(profile?.role ?? '')
        : profile?.role === 'admin'

    if (!allowed) {
      const url = request.nextUrl.clone()
      url.pathname = `${locale === 'ar' ? '/ar' : ''}/dashboard`
      url.searchParams.set('error', 'access_denied')
      return NextResponse.redirect(url)
    }
  }

  if (localeMatch) return rewriteWithCookies(request, pathname, requestHeaders, response)
  return response
}

function rewriteWithCookies(request: NextRequest, pathname: string, headers: Headers, source: NextResponse) {
  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = pathname
  const rewritten = NextResponse.rewrite(rewriteUrl, { request: { headers } })
  source.cookies.getAll().forEach((cookie) => {
    rewritten.cookies.set(cookie)
  })
  return rewritten
}
