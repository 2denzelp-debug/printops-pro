import { NextRequest } from 'next/server'
import { withAuth, ok } from '@/lib/api'
import prisma from '@/lib/prisma'

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const filter = searchParams.get('filter') // low|out|all
  const category = searchParams.get('category')

  const items = await prisma.inventoryItem.findMany({
    where: { organizationId: ctx.orgId },
    include: {
      material: true,
      variant: { include: { product: true } },
      warehouse: true,
      location: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  let filtered = items

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(i =>
      i.material?.name.toLowerCase().includes(q) ||
      i.material?.category.toLowerCase().includes(q) ||
      i.location?.label.toLowerCase().includes(q) ||
      i.location?.zone.toLowerCase().includes(q)
    )
  }

  if (filter === 'low') filtered = filtered.filter(i => Number(i.qtyAvailable) > 0 && Number(i.qtyAvailable) <= Number(i.qtyMinThreshold))
  if (filter === 'out') filtered = filtered.filter(i => Number(i.qtyAvailable) <= 0)

  if (category) filtered = filtered.filter(i => i.material?.category === category)

  const stats = {
    total: items.length,
    outOfStock: items.filter(i => Number(i.qtyAvailable) <= 0).length,
    lowStock: items.filter(i => Number(i.qtyAvailable) > 0 && Number(i.qtyAvailable) <= Number(i.qtyMinThreshold)).length,
    categories: [...new Set(items.map(i => i.material?.category).filter(Boolean))],
  }

  return ok({ items: filtered, stats })
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const { inventoryItemId, type, qty, notes } = await req.json()
  if (!inventoryItemId || !type || !qty) return ok({ error: 'Dati incompleti' }, 400)

  const item = await prisma.inventoryItem.findFirst({
    where: { id: inventoryItemId, organizationId: ctx.orgId },
  })
  if (!item) return ok({ error: 'Articolo non trovato' }, 404)

  let newQty = Number(item.qtyAvailable)
  if (type === 'carico') newQty += Number(qty)
  else if (type === 'scarico') newQty = Math.max(0, newQty - Number(qty))
  else if (type === 'rettifica') newQty = Number(qty)

  const [updatedItem, movement] = await prisma.$transaction([
    prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { qtyAvailable: newQty },
    }),
    prisma.inventoryMovement.create({
      data: {
        organizationId: ctx.orgId,
        inventoryItemId,
        type,
        qty: Number(qty),
        notes,
        createdBy: ctx.userId,
      },
    }),
  ])

  return ok({ item: updatedItem, movement }, 201)
})
