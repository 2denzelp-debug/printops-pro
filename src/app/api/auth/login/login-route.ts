import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, signJWT, COOKIE_NAME } from '@/lib/auth'
import { fail } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { email, password, slug } = await req.json()
    if (!email || !password || !slug) return fail('Email, password e slug azienda richiesti')

    const org = await prisma.organization.findFirst({ where: { slug, isActive: true } })
    if (!org) return fail('Azienda non trovata', 404)

    const user = await prisma.user.findFirst({
      where: { email, organizationId: org.id, isActive: true },
    })
    if (!user) return fail('Credenziali non valide', 401)

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) return fail('Credenziali non valide', 401)

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

    const token = signJWT({ userId: user.id, orgId: org.id, role: user.role, email: user.email })

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        org: { id: org.id, name: org.name, slug: org.slug, plan: org.plan, accentColor: org.accentColor },
      }
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (e) {
    console.error(e)
    return fail('Errore del server', 500)
  }
}
