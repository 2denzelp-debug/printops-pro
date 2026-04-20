import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, ok, fail } from '@/lib/api'

// GET /api/team/messages?channelId=xxx&limit=50&before=timestamp
export const GET = withAuth(async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('channelId')
  const limit = parseInt(searchParams.get('limit') || '50')
  const before = searchParams.get('before')

  if (!channelId) return fail('channelId richiesto')

  // Verifica che il canale appartenga all'org
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, organizationId: ctx.orgId },
  })
  if (!channel) return fail('Canale non trovato', 404)

  const messages = await prisma.teamMessage.findMany({
    where: {
      channelId,
      organizationId: ctx.orgId,
      deletedAt: null,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { reactions: true },
  })

  // Aggiorna lastRead per questo utente
  await prisma.channelMember.updateMany({
    where: { channelId, userId: ctx.userId },
    data: { lastRead: new Date() },
  })

  return ok({ messages: messages.reverse() })
})

// POST /api/team/messages — invia messaggio
export const POST = withAuth(async (req, ctx) => {
  const body = await req.json()
  const { channelId, content, type = 'TEXT', attachmentUrl, attachmentName, refType, refId, refLabel } = body

  if (!channelId || !content?.trim()) return fail('channelId e content richiesti')

  const channel = await prisma.channel.findFirst({
    where: { id: channelId, organizationId: ctx.orgId },
  })
  if (!channel) return fail('Canale non trovato', 404)

  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { name: true, avatar: true },
  })

  const message = await prisma.teamMessage.create({
    data: {
      organizationId: ctx.orgId,
      channelId,
      userId: ctx.userId,
      userName: user?.name || ctx.email,
      userAvatar: user?.avatar,
      content: content.trim(),
      type,
      attachmentUrl,
      attachmentName,
      refType,
      refId,
      refLabel,
    },
    include: { reactions: true },
  })

  // Se il messaggio menziona un ordine, aggiungi alla timeline ordine
  if (refType === 'order' && refId) {
    await prisma.orderActivity.create({
      data: {
        organizationId: ctx.orgId,
        orderId: refId,
        userId: ctx.userId,
        userName: user?.name || ctx.email,
        userAvatar: user?.avatar,
        type: 'COMMENT',
        content: `💬 ${user?.name || ctx.email}: ${content.trim()}`,
      },
    })
  }

  // Crea notifiche per @menzioni
  const mentions = content.match(/@([a-zA-Z0-9_-]+)/g) || []
  if (mentions.length > 0) {
    const orgUsers = await prisma.user.findMany({
      where: { organizationId: ctx.orgId, isActive: true },
      select: { id: true, name: true },
    })
    for (const mention of mentions) {
      const mentionName = mention.slice(1).toLowerCase()
      const mentionedUser = orgUsers.find(u => u.name.toLowerCase().replace(/\s/g, '') === mentionName || u.name.toLowerCase().startsWith(mentionName))
      if (mentionedUser && mentionedUser.id !== ctx.userId) {
        await prisma.notification.create({
          data: {
            organizationId: ctx.orgId,
            userId: mentionedUser.id,
            type: 'mention',
            title: `${user?.name} ti ha menzionato`,
            body: content.slice(0, 100),
            refType: 'channel',
            refId: channelId,
          },
        })
      }
    }
  }

  return ok({ message }, 201)
})
