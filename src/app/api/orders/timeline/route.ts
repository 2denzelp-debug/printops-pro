import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, ok, fail } from '@/lib/api'

// GET /api/orders/timeline?orderId=xxx
export const GET = withAuth(async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  if (!orderId) return fail('orderId richiesto')

  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: ctx.orgId },
    select: { id: true, code: true },
  })
  if (!order) return fail('Ordine non trovato', 404)

  const activities = await prisma.orderActivity.findMany({
    where: { orderId, organizationId: ctx.orgId },
    orderBy: { createdAt: 'asc' },
  })

  // Carica anche i task collegati a quest'ordine
  const tasks = await prisma.task.findMany({
    where: { organizationId: ctx.orgId, refType: 'order', refId: orderId },
    orderBy: { createdAt: 'desc' },
    include: { comments: { orderBy: { createdAt: 'asc' } } },
  })

  return ok({ activities, tasks, order })
})

// POST /api/orders/timeline — aggiungi commento/attività
export const POST = withAuth(async (req, ctx) => {
  const { orderId, content, type = 'COMMENT', attachmentUrl } = await req.json()
  if (!orderId || !content?.trim()) return fail('orderId e content richiesti')

  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: ctx.orgId },
  })
  if (!order) return fail('Ordine non trovato', 404)

  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { name: true, avatar: true },
  })

  const activity = await prisma.orderActivity.create({
    data: {
      organizationId: ctx.orgId,
      orderId,
      userId: ctx.userId,
      userName: user?.name || ctx.email,
      userAvatar: user?.avatar,
      type,
      content: content.trim(),
      attachmentUrl,
    },
  })

  // Notifica gli altri utenti che hanno commentato su questo ordine
  const otherCommenters = await prisma.orderActivity.findMany({
    where: {
      orderId,
      userId: { not: ctx.userId },
      type: { in: ['COMMENT', 'NOTE', 'MENTION'] },
    },
    distinct: ['userId'],
    select: { userId: true },
  })

  for (const commenter of otherCommenters) {
    await prisma.notification.create({
      data: {
        organizationId: ctx.orgId,
        userId: commenter.userId,
        type: 'order_update',
        title: `Nuovo commento su ${order.code}`,
        body: `${user?.name}: ${content.slice(0, 80)}`,
        refType: 'order',
        refId: orderId,
      },
    })
  }

  return ok({ activity }, 201)
})
