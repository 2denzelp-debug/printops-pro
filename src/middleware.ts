import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'

const PUBLIC = ['/login', '/register', '/api/auth/login', '/api/auth/register']
const BILLING_OK = ['/billing', '/api/billing', '/api/stripe']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Public routes
  if (PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Stripe webhooks — no auth
  if (pathname.startsWith('/api/stripe/webhook')) {
    return NextResponse.next()
  }

  const token = req.cookies.get('printops_token')?.value

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const payload = verifyJWT(token)
    const res = NextResponse.next()
    res.headers.set('x-user-id', payload.userId)
    res.headers.set('x-org-id', payload.orgId)
    res.headers.set('x-user-role', payload.role)
    return res
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('printops_token')
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
