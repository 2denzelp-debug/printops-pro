import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, COOKIE_NAME } from '@/lib/auth'

const PUBLIC = ['/login', '/register', '/api/auth/login', '/api/auth/register']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next()
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))
  try {
    verifyJWT(token)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
