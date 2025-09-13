import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SIGNIN_ROUTES = ['/signin', '/signup']
const USER_ROUTES = ['/cart']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('payload-token')?.value // adjust cookie name if different

  // ✅ Rule 1: Logged-in users cannot access SIGNIN_ROUTES
  if (token && SIGNIN_ROUTES.includes(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = '/' // or '/dashboard'
    return NextResponse.redirect(url)
  }

  // ✅ Rule 2: Non-logged users cannot access USER_ROUTES
  if (!token && USER_ROUTES.includes(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Run middleware only on specific pages
export const config = {
  matcher: ['/cart', '/signin', '/signup'],
}
