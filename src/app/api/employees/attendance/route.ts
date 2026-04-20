import { NextRequest } from 'next/server'
import { withAuth, ok, fail } from '@/lib/api'
import prisma from '@/lib/prisma'

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const { employeeId, action } = await req.json()
  if (!employeeId || !action) return fail('employeeId e action richiesti')

  const today = new Date(); today.setHours(0,0,0,0)
  const existing = await prisma.attendance.findUnique({ where: { employeeId_date: { employeeId, date: today } } })
  const now = new Date()

  if (action === 'checkin') {
    const att = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      update: { checkIn: now },
      create: { employeeId, date: today, checkIn: now, type: 'lavoro' },
    })
    return ok({ attendance: att })
  }

  if (action === 'checkout' && existing?.checkIn) {
    const hours = (now.getTime() - existing.checkIn.getTime()) / 3600000
    const overtime = Math.max(0, hours - 8)
    const att = await prisma.attendance.update({
      where: { employeeId_date: { employeeId, date: today } },
      data: { checkOut: now, hoursWorked: parseFloat(hours.toFixed(2)), overtime: parseFloat(overtime.toFixed(2)) },
    })
    return ok({ attendance: att })
  }

  return fail('Azione non valida')
})
