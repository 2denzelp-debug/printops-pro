import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, signJWT, COOKIE_NAME } from '@/lib/auth'
import { fail } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { orgName, slug, email, password, name } = await req.json()
    if (!orgName || !slug || !email || !password) return fail('Tutti i campi sono richiesti')

    const existing = await prisma.organization.findFirst({ where: { slug } })
    if (existing) return fail('Slug già in uso — scegli un altro', 409)

    const pw = await hashPassword(password)

    const org = await prisma.organization.create({
      data: { name: orgName, slug, plan: 'TRIAL', planStatus: 'TRIAL', maxUsers: 3, email },
    })

    const user = await prisma.user.create({
      data: { organizationId: org.id, email, passwordHash: pw, name: name || orgName, role: 'OWNER' },
    })

    const token = signJWT({ userId: user.id, orgId: org.id, role: user.role, email: user.email })

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        org: { id: org.id, name: org.name, slug: org.slug, plan: org.plan },
      }
    }, { status: 201 })

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
