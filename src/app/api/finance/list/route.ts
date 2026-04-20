import { NextRequest } from 'next/server'
import { withAuth, ok } from '@/lib/api'
import prisma from '@/lib/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth()
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()

  const start = new Date(year, month, 1)
  const end   = new Date(year, month + 1, 0)

  const entries = await prisma.financialEntry.findMany({
    where: { organizationId: ctx.orgId, date: { gte: start, lte: end } },
    orderBy: { date: 'desc' },
  })

  const entrate = entries.filter(e => e.type === 'entrata').reduce((a, e) => a + Number(e.amount), 0)
  const uscite  = entries.filter(e => e.type === 'uscita').reduce((a, e) => a + Number(e.amount), 0)

  return ok({ entries, summary: { entrate, uscite, margine: entrate - uscite } })
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const body = await req.json()
  const { type, category, description, amount, date, notes } = body
  const entry = await prisma.financialEntry.create({
    data: { organizationId: ctx.orgId, type, category, description, amount, date: new Date(date), notes, createdBy: ctx.userId },
  })
  return ok({ entry }, 201)
})
