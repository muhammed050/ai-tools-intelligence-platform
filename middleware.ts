import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return response
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: cookies => { cookies.forEach(({name,value}) => request.cookies.set(name,value)); response = NextResponse.next({request}); cookies.forEach(({name,value,options}) => response.cookies.set(name,value,options)) } } })
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname
  const dashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const admin = pathname === '/admin' || pathname.startsWith('/admin/')
  if ((dashboard || admin) && !user) { const u=request.nextUrl.clone(); u.pathname='/auth/sign-in'; u.searchParams.set('next',pathname); return NextResponse.redirect(u) }
  if (user && admin) {
    const {data: profile}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle()
    const editorArea=pathname.startsWith('/admin/tools') || pathname.startsWith('/admin/reviews')
    if (pathname==='/admin' || pathname.startsWith('/admin/users') || pathname.startsWith('/admin/analytics') || pathname.startsWith('/admin/ai') || pathname.startsWith('/admin/seo')) {
      if(profile?.role!=='admin'){const u=request.nextUrl.clone();u.pathname='/dashboard';u.searchParams.set('error','access_denied');return NextResponse.redirect(u)}
    } else if (editorArea && !['admin','editor'].includes(profile?.role??'')) {
      const u=request.nextUrl.clone();u.pathname='/dashboard';u.searchParams.set('error','access_denied');return NextResponse.redirect(u)
    }
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
