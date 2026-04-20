import { withAuth, ok, fail } from '@/lib/api'
import prisma from '@/lib/prisma'

export const GET = withAuth(async (req, ctx) => {
  const [user, org] = await Promise.all([
    prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { id: true, name: true, email: true, role: true, department: true, avatar: true },
    }),
    prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: {
        id: true, name: true, slug: true, logo: true, accentColor: true,
        plan: true, planStatus: true, maxUsers: true, trialEndsAt: true,
        email: true, phone: true, city: true,
        _count: { select: { users: { where: { isActive: true } } } },
      },
    }),
  ])

  if (!user || !org) return fail('Utente non trovato', 404)

  return ok({ user, org: { ...org, currentUsers: org._count.users } })
})
