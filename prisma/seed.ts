import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding PrintOps database...')

  // ─── Organizzazione demo ───────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'printshop-demo' },
    update: {},
    create: {
      name: 'PrintShop Demo srl',
      slug: 'printshop-demo',
      plan: 'STUDIO',
      planStatus: 'ACTIVE',
      maxUsers: 15,
      accentColor: '#22c55e',
      email: 'info@printshop.it',
      phone: '+39 02 1234 5678',
      vatNumber: 'IT12345678901',
      address: 'Via della Stampa 12',
      city: 'Milano',
      zip: '20100',
    },
  })
  console.log('✅ Organization:', org.name)

  // ─── Utenti team ──────────────────────────────────────
  const pw = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email_organizationId: { email: 'admin@printshop.it', organizationId: org.id } },
      update: {},
      create: { organizationId: org.id, email: 'admin@printshop.it', passwordHash: pw, name: 'Luca Bianchi', role: 'OWNER', department: 'Direzione' },
    }),
    prisma.user.upsert({
      where: { email_organizationId: { email: 'giulia@printshop.it', organizationId: org.id } },
      update: {},
      create: { organizationId: org.id, email: 'giulia@printshop.it', passwordHash: pw, name: 'Giulia Mancini', role: 'OPERATOR', department: 'Produzione' },
    }),
    prisma.user.upsert({
      where: { email_organizationId: { email: 'marco@printshop.it', organizationId: org.id } },
      update: {},
      create: { organizationId: org.id, email: 'marco@printshop.it', passwordHash: pw, name: 'Marco Ferretti', role: 'OPERATOR', department: 'Stampa' },
    }),
    prisma.user.upsert({
      where: { email_organizationId: { email: 'sara@printshop.it', organizationId: org.id } },
      update: {},
      create: { organizationId: org.id, email: 'sara@printshop.it', passwordHash: pw, name: 'Sara Romano', role: 'GRAPHIC', department: 'Reparto Grafico' },
    }),
    prisma.user.upsert({
      where: { email_organizationId: { email: 'andrea@printshop.it', organizationId: org.id } },
      update: {},
      create: { organizationId: org.id, email: 'andrea@printshop.it', passwordHash: pw, name: 'Andrea Conti', role: 'OPERATOR', department: 'Magazzino' },
    }),
  ])
  console.log('✅ Users:', users.length)

  const [admin, giulia, marco, sara, andrea] = users

  // ─── Canali team (creati automaticamente) ─────────────
  const defaultChannels = [
    { name: 'generale',   description: 'Comunicazioni generali per tutto il team', isDefault: true },
    { name: 'produzione', description: 'Aggiornamenti e coordinamento produzione' },
    { name: 'grafico',    description: 'Artwork, proof e approvazioni grafiche' },
    { name: 'magazzino',  description: 'Stock, rifornimenti e movimenti' },
    { name: 'vendite',    description: 'Preventivi, ordini e clienti' },
    { name: 'urgenti',    description: '🚨 Solo comunicazioni urgenti' },
  ]

  const createdChannels: Record<string, string> = {}

  for (const ch of defaultChannels) {
    const existing = await prisma.channel.findFirst({ where: { organizationId: org.id, name: ch.name } })
    if (!existing) {
      const channel = await prisma.channel.create({
        data: {
          organizationId: org.id,
          name: ch.name,
          description: ch.description,
          isDefault: ch.isDefault || false,
          createdBy: admin.id,
          members: { create: users.map(u => ({ userId: u.id })) },
        },
      })
      createdChannels[ch.name] = channel.id

      // Messaggio di benvenuto
      await prisma.teamMessage.create({
        data: {
          organizationId: org.id,
          channelId: channel.id,
          userId: admin.id,
          userName: 'Sistema',
          content: `👋 Benvenuti in #${ch.name}! ${ch.description}`,
          type: 'SYSTEM',
        },
      })
    } else {
      createdChannels[ch.name] = existing.id
    }
  }
  console.log('✅ Channels:', Object.keys(createdChannels).length)

  // ─── Messaggi demo nel canale generale ────────────────
  if (createdChannels['generale']) {
    const demoMsgs = [
      { user: admin,  content: 'Buongiorno a tutti! Oggi abbiamo 2 ordini urgenti da finire 🎯' },
      { user: giulia, content: 'Ho finito la stampa di ORD-031. Polo nere pronte per confezionamento', refType: 'order', refLabel: 'ORD-031' },
      { user: marco,  content: '@sara il file per le jersey di Bianchi Sport ha un problema di risoluzione, riesci a controllare?' },
      { user: sara,   content: 'Controllato! Il logo era in 72dpi, ho già rifatto a 300dpi e caricato la versione corretta' },
      { user: andrea, content: 'Attenzione: Polo nera L è esaurita. Ho già inoltrato l\'ordine al fornitore, arriva giovedì' },
    ]

    for (const msg of demoMsgs) {
      await prisma.teamMessage.create({
        data: {
          organizationId: org.id,
          channelId: createdChannels['generale'],
          userId: msg.user.id,
          userName: msg.user.name,
          content: msg.content,
          type: 'TEXT',
          refType: (msg as { refType?: string }).refType,
          refLabel: (msg as { refLabel?: string }).refLabel,
        },
      })
    }
  }

  // ─── Clienti ──────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { code_organizationId: { code: 'CLI-001', organizationId: org.id } },
      update: {},
      create: { organizationId: org.id, code: 'CLI-001', name: 'Marco Rossi', company: 'Rossi Events', email: 'marco@rossi.it', phone: '+39 333 123 4567', city: 'Milano' },
    }),
    prisma.customer.upsert({
      where: { code_organizationId: { code: 'CLI-002', organizationId: org.id } },
      update: {},
      create: { organizationId: org.id, code: 'CLI-002', name: 'Anna Conti', company: 'Conti Uniforms', email: 'anna@contiuniforms.it', phone: '+39 347 234 5678', city: 'Bologna' },
    }),
    prisma.customer.upsert({
      where: { code_organizationId: { code: 'CLI-003', organizationId: org.id } },
      update: {},
      create: { organizationId: org.id, code: 'CLI-003', name: 'Sara Bianchi', company: 'Bianchi Sport', email: 'sara@bianchi.it', city: 'Torino' },
    }),
  ])
  console.log('✅ Customers:', customers.length)

  // ─── Magazzino ────────────────────────────────────────
  const warehouse = await prisma.warehouse.findFirst({ where: { organizationId: org.id } })
    ?? await prisma.warehouse.create({ data: { organizationId: org.id, name: 'Magazzino principale', location: 'Lab A' } })

  const loc = await prisma.warehouseLocation.create({
    data: { warehouseId: warehouse.id, zone: 'Scaffale A', shelf: 'Ripiano 2', label: 'A-2' },
  })

  const mat = await prisma.material.upsert({
    where: { code_organizationId: { code: 'MAT-001', organizationId: org.id } },
    update: {},
    create: { organizationId: org.id, code: 'MAT-001', name: 'T-shirt bianca M', category: 'tessuto', unit: 'pz', costPerUnit: 3.5 },
  })

  const existingItem = await prisma.inventoryItem.findFirst({ where: { organizationId: org.id, materialId: mat.id } })
  if (!existingItem) {
    await prisma.inventoryItem.create({
      data: { organizationId: org.id, materialId: mat.id, warehouseId: warehouse.id, locationId: loc.id, qtyAvailable: 62, qtyMinThreshold: 30 },
    })
  }
  console.log('✅ Warehouse seeded')

  // ─── Ordine demo con timeline ──────────────────────────
  const order = await prisma.order.upsert({
    where: { code_organizationId: { code: 'ORD-031', organizationId: org.id } },
    update: {},
    create: {
      organizationId: org.id,
      code: 'ORD-031',
      customerId: customers[0].id,
      source: 'shopify',
      sourceId: 'SHO-5821',
      status: 'in_produzione',
      isUrgent: true,
      priority: 1,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      totalAmount: 480,
      createdBy: admin.id,
    },
  })

  // Timeline ordine demo
  const timelineEvents = [
    { user: admin,  type: 'STATUS_CHANGE', content: '📦 Ordine ORD-031 creato e confermato', oldValue: null, newValue: 'confermato' },
    { user: andrea, type: 'NOTE',          content: 'Ho verificato lo stock. Polo nere S e M disponibili, L in arrivo giovedì' },
    { user: sara,   type: 'FILE_UPLOAD',   content: '🎨 Artwork caricato: logo_rossi_fronte_v2.ai (4.2 MB) — 300dpi pronto per stampa' },
    { user: giulia, type: 'PRODUCTION_UPDATE', content: '🖨️ Avviata stampa serigrafia fronte — 40/50 pezzi completati' },
    { user: marco,  type: 'COMMENT',       content: 'Il bianco dell\'inchiostro è perfetto. Procederei anche con il retro senza attendere approvazione' },
    { user: giulia, type: 'PRODUCTION_UPDATE', content: '✅ Stampa completata — 50/50 pezzi. Passato al confezionamento' },
  ]

  for (const ev of timelineEvents) {
    await prisma.orderActivity.create({
      data: {
        organizationId: org.id,
        orderId: order.id,
        userId: ev.user.id,
        userName: ev.user.name,
        type: ev.type as never,
        content: ev.content,
        oldValue: (ev as { oldValue?: string | null }).oldValue ?? null,
        newValue: (ev as { newValue?: string }).newValue,
      },
    })
  }
  console.log('✅ Order + timeline seeded')

  // ─── Task demo ────────────────────────────────────────
  await prisma.task.create({
    data: {
      organizationId: org.id,
      title: 'Verificare artwork ORD-031 prima della stampa',
      description: 'Controllare risoluzione minima 300dpi e colori CMYK',
      type: 'grafico',
      priority: 'ALTA',
      status: 'COMPLETATO',
      assignedTo: sara.id,
      assignedName: sara.name,
      createdBy: admin.id,
      createdByName: admin.name,
      completedAt: new Date(),
      refType: 'order',
      refId: order.id,
      refLabel: 'ORD-031',
    },
  })

  await prisma.task.create({
    data: {
      organizationId: org.id,
      title: 'Ordinare Polo nera L — stock esaurito',
      description: 'Minimo 50 pz per evitare blocchi produzione. Fornitore: Tessuti Italia',
      type: 'magazzino',
      priority: 'CRITICA',
      status: 'IN_CORSO',
      assignedTo: andrea.id,
      assignedName: andrea.name,
      createdBy: admin.id,
      createdByName: admin.name,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  await prisma.task.create({
    data: {
      organizationId: org.id,
      title: 'Preparare preventivo per Sport Club Milano — 80 jersey',
      type: 'vendite',
      priority: 'MEDIA',
      status: 'APERTO',
      assignedTo: admin.id,
      assignedName: admin.name,
      createdBy: admin.id,
      createdByName: admin.name,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  })
  console.log('✅ Tasks seeded')

  // ─── Dipendenti ───────────────────────────────────────
  await prisma.employee.createMany({
    data: [
      { organizationId: org.id, name: 'Giulia Mancini', email: 'giulia@printshop.it', role: 'Operatrice stampa', department: 'Produzione', hourlyRate: 16, monthlyHours: 168 },
      { organizationId: org.id, name: 'Marco Ferretti', email: 'marco@printshop.it', role: 'Ricamatore', department: 'Produzione', hourlyRate: 18, monthlyHours: 152 },
      { organizationId: org.id, name: 'Sara Romano', email: 'sara@printshop.it', role: 'Grafica', department: 'Reparto Grafico', hourlyRate: 20, monthlyHours: 160 },
      { organizationId: org.id, name: 'Andrea Conti', email: 'andrea@printshop.it', role: 'Magazziniere', department: 'Magazzino', hourlyRate: 14, monthlyHours: 168 },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Employees seeded')

  // ─── Macchine ─────────────────────────────────────────
  await prisma.machine.createMany({
    data: [
      { organizationId: org.id, name: 'Stampante DTF Pro X8', type: 'dtf', status: 'operativa', location: 'Lab A', serialNumber: 'DTF-0023' },
      { organizationId: org.id, name: 'Ricamatrice Tajima 6T', type: 'ricamo', status: 'guasta', location: 'Lab A', serialNumber: 'TAJ-0441', notes: 'Ago rotto — assistenza richiesta' },
      { organizationId: org.id, name: 'Pressa piana 60×80', type: 'pressa', status: 'operativa', location: 'Lab B' },
      { organizationId: org.id, name: 'DTG Epson F3070', type: 'dtg', status: 'operativa', location: 'Lab A', serialNumber: 'EPS-0234' },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Machines seeded')

  console.log('\n🎉 Seed completato!')
  console.log('─────────────────────────────────────────')
  console.log('Login demo:')
  console.log('  Slug:     printshop-demo')
  console.log('  Email:    admin@printshop.it')
  console.log('  Password: password123')
  console.log('─────────────────────────────────────────')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
