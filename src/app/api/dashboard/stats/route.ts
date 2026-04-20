import { withAuth, ok } from '@/lib/api'
import prisma from '@/lib/prisma'

export const GET = withAuth(async (req, ctx) => {
  const orgId = ctx.orgId
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [orderCount, urgentOrders, openTasks, unreadNotifications, monthRevenue, recentOrders, machines, allStock] = await Promise.all([
    prisma.order.count({ where: { organizationId: orgId, status: { notIn: ['completato','spedito','consegnato','annullato'] } } }),
    prisma.order.count({ where: { organizationId: orgId, isUrgent: true, status: { notIn: ['completato','annullato'] } } }),
    prisma.task.count({ where: { organizationId: orgId, status: { in: ['APERTO','IN_CORSO'] } } }),
    prisma.notification.count({ where: { organizationId: orgId, userId: ctx.userId, isRead: false } }),
    prisma.order.aggregate({ where: { organizationId: orgId, createdAt: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
    prisma.order.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' }, take: 6, include: { customer: { select: { name: true, company: true } } } }),
    prisma.machine.findMany({ where: { organizationId: orgId }, orderBy: { status: 'asc' } }),
    prisma.inventoryItem.findMany({ where: { organizationId: orgId }, include: { material: true, location: true } }),
  ])

  const criticalStock = allStock.filter(i => Number(i.qtyAvailable) <= Number(i.qtyMinThreshold))

  return ok({
    stats: { orderCount, urgentOrders, openTasks, unreadNotifications, lowStock: criticalStock.length, monthRevenue: Number(monthRevenue._sum.totalAmount || 0) },
    recentOrders,
    criticalStock: criticalStock.slice(0, 8),
    machines,
  })
})
