import { NextRequest } from 'next/server'
import { withAuth, ok } from '@/lib/api'
import prisma from '@/lib/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const urgent = searchParams.get('urgent')
  const source = searchParams.get('source')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: Record<string, unknown> = { organizationId: ctx.orgId }
  if (status) where.status = status
  if (urgent === 'true') where.isUrgent = true
  if (source) where.source = source
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { company: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: [{ isUrgent: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { id: true, name: true, company: true } },
        _count: { select: { items: true, productionJobs: true } },
      },
    }),
    prisma.order.count({ where }),
  ])

  return ok({ orders, total, page, pages: Math.ceil(total / limit) })
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const body = await req.json()
  const { customerId, quoteId, source = 'manual', isUrgent, priority, dueDate, notes, items = [] } = body

  if (!customerId) return ok({ error: 'customerId richiesto' }, 400)

  // Genera codice progressivo
  const last = await prisma.order.findFirst({
    where: { organizationId: ctx.orgId },
    orderBy: { createdAt: 'desc' },
    select: { code: true },
  })
  const num = last ? parseInt(last.code.split('-')[1] || '0') + 1 : 1
  const code = `ORD-${num.toString().padStart(3, '0')}`

  const totalAmount = items.reduce((sum: number, i: { qty: number; unitPrice: number; discountPct?: number }) =>
    sum + i.qty * i.unitPrice * (1 - (i.discountPct || 0) / 100), 0)

  const order = await prisma.order.create({
    data: {
      organizationId: ctx.orgId,
      code,
      customerId,
      quoteId,
      source,
      isUrgent: isUrgent || false,
      priority: priority || 3,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      totalAmount,
      notes,
      createdBy: ctx.userId,
      items: {
        create: items.map((i: { description: string; qty: number; unitPrice: number; discountPct?: number; technique?: string; artworkUrl?: string; notes?: string }) => ({
          description: i.description,
          qty: i.qty,
          unitPrice: i.unitPrice,
          discountPct: i.discountPct || 0,
          technique: i.technique,
          artworkUrl: i.artworkUrl,
          notes: i.notes,
          total: i.qty * i.unitPrice * (1 - (i.discountPct || 0) / 100),
        })),
      },
    },
    include: { customer: true, items: true },
  })

  // Aggiungi alla timeline
  await prisma.orderActivity.create({
    data: {
      organizationId: ctx.orgId,
      orderId: order.id,
      userId: ctx.userId,
      userName: ctx.email,
      type: 'STATUS_CHANGE',
      content: `📦 Ordine ${code} creato`,
      newValue: 'nuovo',
    },
  })

  return ok({ order }, 201)
})
