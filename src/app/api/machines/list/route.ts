import { NextRequest } from 'next/server'
import { withAuth, ok } from '@/lib/api'
import prisma from '@/lib/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const machines = await prisma.machine.findMany({
    where: { organizationId: ctx.orgId },
    orderBy: { status: 'asc' },
    include: {
      inkUsage: { orderBy: { date: 'desc' }, take: 1 },
      serviceRequests: { where: { status: { in: ['aperta','in_corso'] } }, take: 3 },
    },
  })
  return ok({ machines })
})
