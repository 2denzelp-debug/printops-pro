import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, ok, fail } from '@/lib/api'

// GET /api/tasks?assignedTo=me|userId&status=APERTO&refType=order&refId=xxx
export const GET = withAuth(async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const assignedTo = searchParams.get('assignedTo')
  const status = searchParams.get('status')
  const refType = searchParams.get('refType')
  const refId = searchParams.get('refId')
  const priority = searchParams.get('priority')

  const tasks = await prisma.task.findMany({
    where: {
      organizationId: ctx.orgId,
      ...(assignedTo === 'me' ? { assignedTo: ctx.userId } : assignedTo ? { assignedTo } : {}),
      ...(status ? { status: status as never } : {}),
      ...(refType ? { refType } : {}),
      ...(refId ? { refId } : {}),
      ...(priority ? { priority: priority as never } : {}),
    },
    orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    include: {
      comments: { orderBy: { createdAt: 'asc' } },
    },
  })

  const counts = {
    aperto: tasks.filter(t => t.status === 'APERTO').length,
    in_corso: tasks.filter(t => t.status === 'IN_CORSO').length,
    completato: tasks.filter(t => t.status === 'COMPLETATO').length,
    scaduto: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'COMPLETATO').length,
  }

  return ok({ tasks, counts })
})

// POST /api/tasks — crea task e notifica assegnatario
export const POST = withAuth(async (req, ctx) => {
  const body = await req.json()
  const {
    title, description, type, priority = 'MEDIA',
    assignedTo, dueDate, refType, refId, refLabel, channelId,
  } = body

  if (!title?.trim()) return fail('Titolo richiesto')

  const creator = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { name: true },
  })

  let assignedName: string | undefined
  if (assignedTo) {
    const assignee = await prisma.user.findFirst({
      where: { id: assignedTo, organizationId: ctx.orgId },
      select: { name: true },
    })
    assignedName = assignee?.name
  }

  const task = await prisma.task.create({
    data: {
      organizationId: ctx.orgId,
      title: title.trim(),
      description,
      type: type || 'interno',
      priority,
      status: 'APERTO',
      assignedTo,
      assignedName,
      createdBy: ctx.userId,
      createdByName: creator?.name || ctx.email,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      refType,
      refId,
      refLabel,
      channelId,
    },
    include: { comments: true },
  })

  // Notifica l'assegnatario
  if (assignedTo && assignedTo !== ctx.userId) {
    await prisma.notification.create({
      data: {
        organizationId: ctx.orgId,
        userId: assignedTo,
        type: 'task_assigned',
        title: `Nuovo task assegnato: ${title}`,
        body: description?.slice(0, 100) || `Da: ${creator?.name}`,
        refType: 'task',
        refId: task.id,
        taskId: task.id,
      },
    })
  }

  // Se collegato a un ordine, aggiungi alla timeline
  if (refType === 'order' && refId) {
    await prisma.orderActivity.create({
      data: {
        organizationId: ctx.orgId,
        orderId: refId,
        userId: ctx.userId,
        userName: creator?.name || ctx.email,
        type: 'TASK_ASSIGNED',
        content: `📋 Task creato: "${title}"${assignedName ? ` → assegnato a ${assignedName}` : ''}`,
      },
    })
  }

  return ok({ task }, 201)
})

// PATCH /api/tasks — aggiorna stato task
export const PATCH = withAuth(async (req, ctx) => {
  const { id, status, assignedTo, dueDate, priority, notes } = await req.json()
  if (!id) return fail('id richiesto')

  const task = await prisma.task.findFirst({
    where: { id, organizationId: ctx.orgId },
  })
  if (!task) return fail('Task non trovato', 404)

  const user = await prisma.user.findUnique({ where: { id: ctx.userId }, select: { name: true } })

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (assignedTo !== undefined) {
    const assignee = await prisma.user.findFirst({ where: { id: assignedTo, organizationId: ctx.orgId }, select: { name: true } })
    updates.assignedTo = assignedTo
    updates.assignedName = assignee?.name
  }
  if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null
  if (priority) updates.priority = priority
  if (notes !== undefined) updates.notes = notes
  if (status === 'COMPLETATO') updates.completedAt = new Date()

  const updated = await prisma.task.update({
    where: { id },
    data: updates,
    include: { comments: true },
  })

  // Timeline ordine se task completato
  if (status === 'COMPLETATO' && task.refType === 'order' && task.refId) {
    await prisma.orderActivity.create({
      data: {
        organizationId: ctx.orgId,
        orderId: task.refId,
        userId: ctx.userId,
        userName: user?.name || ctx.email,
        type: 'TASK_COMPLETED',
        content: `✅ Task completato: "${task.title}"`,
      },
    })
  }

  // Notifica chi ha creato il task se qualcun altro lo completa
  if (status === 'COMPLETATO' && task.createdBy !== ctx.userId) {
    await prisma.notification.create({
      data: {
        organizationId: ctx.orgId,
        userId: task.createdBy,
        type: 'task_completed',
        title: `Task completato: ${task.title}`,
        body: `Completato da ${user?.name}`,
        refType: 'task',
        refId: task.id,
        taskId: task.id,
      },
    })
  }

  return ok({ task: updated })
})
