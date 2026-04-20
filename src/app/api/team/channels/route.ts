import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, ok, fail } from '@/lib/api'

// GET /api/team/channels — lista canali con contatori non letti
export const GET = withAuth(async (req, ctx) => {
  const channels = await prisma.channel.findMany({
    where: { organizationId: ctx.orgId },
    orderBy: { isDefault: 'desc' },
    include: {
      members: { where: { userId: ctx.userId } },
      _count: { select: { messages: true } },
    },
  })

  // Calcola messaggi non letti per ogni canale
  const channelsWithUnread = await Promise.all(
    channels.map(async (ch) => {
      const member = ch.members[0]
      const unread = member?.lastRead
        ? await prisma.teamMessage.count({
            where: {
              channelId: ch.id,
              createdAt: { gt: member.lastRead },
              userId: { not: ctx.userId },
              deletedAt: null,
            },
          })
        : await prisma.teamMessage.count({
            where: { channelId: ch.id, deletedAt: null, userId: { not: ctx.userId } },
          })

      return { ...ch, unreadCount: unread, isMember: ch.members.length > 0 }
    })
  )

  return ok({ channels: channelsWithUnread })
})

// POST /api/team/channels — crea nuovo canale
export const POST = withAuth(async (req, ctx) => {
  const { name, description, type = 'PUBLIC', memberIds = [] } = await req.json()
  if (!name?.trim()) return fail('Nome canale richiesto')

  const exists = await prisma.channel.findFirst({
    where: { organizationId: ctx.orgId, name: name.toLowerCase().replace(/\s/g, '-') },
  })
  if (exists) return fail('Canale già esistente')

  const channel = await prisma.channel.create({
    data: {
      organizationId: ctx.orgId,
      name: name.toLowerCase().replace(/\s/g, '-'),
      description,
      type,
      createdBy: ctx.userId,
      members: {
        create: [
          { userId: ctx.userId }, // chi crea è sempre membro
          ...memberIds.filter((id: string) => id !== ctx.userId).map((userId: string) => ({ userId })),
        ],
      },
    },
  })

  // Messaggio di sistema
  const user = await prisma.user.findUnique({ where: { id: ctx.userId }, select: { name: true } })
  await prisma.teamMessage.create({
    data: {
      organizationId: ctx.orgId,
      channelId: channel.id,
      userId: ctx.userId,
      userName: 'Sistema',
      content: `📢 Canale #${channel.name} creato da ${user?.name}`,
      type: 'SYSTEM',
    },
  })

  return ok({ channel }, 201)
})
