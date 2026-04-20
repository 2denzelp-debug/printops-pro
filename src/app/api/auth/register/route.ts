import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, signJWT, setAuthCookie } from '@/lib/auth'
import { ok, fail } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { orgName, email, password, name } = await req.json()
    if (!orgName || !email || !password || !name) return fail('Tutti i campi sono obbligatori')
    if (password.length < 8) return fail('La password deve avere almeno 8 caratteri')

    const baseSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 40)
    const slugExists = await prisma.organization.findUnique({ where: { slug: baseSlug } })
    const slug = slugExists ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug

    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 14)

    const org = await prisma.organization.create({
      data: { name: orgName, slug, plan: 'TRIAL', planStatus: 'TRIAL', maxUsers: 1, trialEndsAt: trialEnd },
    })

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { organizationId: org.id, email, passwordHash, name, role: 'OWNER' },
    })

    // Magazzino principale automatico
    await prisma.warehouse.create({
      data: { organizationId: org.id, name: 'Magazzino principale', location: 'Lab' },
    })

    const token = signJWT({ userId: user.id, orgId: org.id, role: user.role, email: user.email })
    setAuthCookie(token)

    return ok({
      user: { id: user.id, name, email, role: 'OWNER' },
      org: { id: org.id, name: orgName, slug },
    }, 201)
  } catch (e) {
    console.error(e)
    return fail('Errore del server', 500)
  }
}
