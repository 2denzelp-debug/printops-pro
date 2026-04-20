import { NextRequest } from 'next/server'
import { withAuth, ok, fail } from '@/lib/api'
import prisma from '@/lib/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const employees = await prisma.employee.findMany({
    where: { organizationId: ctx.orgId, isActive: true },
    orderBy: { name: 'asc' },
    include: {
      attendance: {
        where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
        take: 1,
      },
    },
  })
  return ok({ employees })
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const body = await req.json()
  const { name, email, phone, role, department, hourlyRate, monthlyHours, contractType } = body
  if (!name || !role) return fail('Nome e ruolo richiesti')
  const emp = await prisma.employee.create({
    data: { organizationId: ctx.orgId, name, email, phone, role, department, hourlyRate: hourlyRate||0, monthlyHours: monthlyHours||168, contractType: contractType||'dipendente' },
  })
  return ok({ employee: emp }, 201)
})
