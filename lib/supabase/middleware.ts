import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return response

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  if ((isDashboard || isAdmin) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/sign-in'
    url.searchParams.set('next', pathname)
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
      url.pathname = '/dashboard'
      url.searchParams.set('error', 'access_denied')
      return NextResponse.redirect(url)
    }
  }

  return response
}
