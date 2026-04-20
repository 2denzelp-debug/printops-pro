import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, ok, fail } from '@/lib/api'

// GET /api/team/notifications
export const GET = withAuth(async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  const notifications = await prisma.notification.findMany({
    where: {
      userId: ctx.userId,
      organizationId: ctx.orgId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: ctx.userId, organizationId: ctx.orgId, isRead: false },
  })

  return ok({ notifications, unreadCount })
})

// PATCH /api/team/notifications — segna come lette
export const PATCH = withAuth(async (req, ctx) => {
  const { ids, all } = await req.json()

  if (all) {
    await prisma.notification.updateMany({
      where: { userId: ctx.userId, organizationId: ctx.orgId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    return ok({ message: 'Tutte le notifiche segnate come lette' })
  }

  if (!ids?.length) return fail('ids richiesti')
  await prisma.notification.updateMany({
    where: { id: { in: ids }, userId: ctx.userId },
    data: { isRead: true, readAt: new Date() },
  })

  return ok({ message: 'Notifiche aggiornate' })
})
