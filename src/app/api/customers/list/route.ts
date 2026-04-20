import { NextRequest } from 'next/server'
import { withAuth, ok, fail } from '@/lib/api'
import prisma from '@/lib/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: Record<string, unknown> = { organizationId: ctx.orgId }
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { orders: true, quotes: true } },
        orders: { select: { totalAmount: true }, take: 100 },
      },
    }),
    prisma.customer.count({ where }),
  ])

  const customersWithStats = customers.map(c => ({
    ...c,
    orderCount: c._count.orders,
    quoteCount: c._count.quotes,
    totalSpent: c.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
    orders: undefined,
  }))

  return ok({ customers: customersWithStats, total, page, pages: Math.ceil(total / limit) })
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const body = await req.json()
  const { name, company, email, phone, whatsapp, address, city, zip, province, vatNumber, notes, status = 'attivo' } = body
  if (!name) return fail('Nome richiesto')

  const last = await prisma.customer.findFirst({
    where: { organizationId: ctx.orgId },
    orderBy: { createdAt: 'desc' },
    select: { code: true },
  })
  const num = last ? parseInt(last.code.split('-')[1] || '0') + 1 : 1
  const code = `CLI-${num.toString().padStart(3, '0')}`

  const customer = await prisma.customer.create({
    data: { organizationId: ctx.orgId, code, name, company, email, phone, whatsapp, address, city, zip, province, vatNumber, notes, status },
  })

  return ok({ customer }, 201)
})
