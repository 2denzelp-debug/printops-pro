import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { withAuth, ok, fail } from '@/lib/api'
import prisma from '@/lib/prisma'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Funzioni AI (Tool Calls) ────────────────────────────

async function get_stock(orgId: string, search?: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { organizationId: orgId },
    include: { material: true, location: true },
    take: 50,
  })
  const filtered = search
    ? items.filter(i => i.material?.name.toLowerCase().includes(search.toLowerCase()))
    : items
  return filtered.map(i => ({
    nome: i.material?.name,
    categoria: i.material?.category,
    disponibile: Number(i.qtyAvailable),
    minimo: Number(i.qtyMinThreshold),
    unita: i.material?.unit,
    posizione: i.location?.label,
    critico: Number(i.qtyAvailable) <= Number(i.qtyMinThreshold),
  }))
}

async function get_orders(orgId: string, status?: string, urgent?: boolean) {
  const where: Record<string, unknown> = { organizationId: orgId }
  if (status) where.status = status
  if (urgent) where.isUrgent = true
  const orders = await prisma.order.findMany({
    where, take: 20,
    orderBy: [{ isUrgent: 'desc' }, { dueDate: 'asc' }],
    include: { customer: { select: { name: true, company: true } } },
  })
  return orders.map(o => ({
    codice: o.code, cliente: o.customer?.name, azienda: o.customer?.company,
    stato: o.status, urgente: o.isUrgent, scadenza: o.dueDate,
    valore: Number(o.totalAmount), fonte: o.source,
  }))
}

async function get_order_status(orgId: string, code: string) {
  const order = await prisma.order.findFirst({
    where: { organizationId: orgId, code: { contains: code, mode: 'insensitive' } },
    include: {
      customer: true,
      items: true,
      productionJobs: { include: { steps: true } },
      shipments: true,
      activities: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })
  if (!order) return null
  return {
    codice: order.code, stato: order.status, urgente: order.isUrgent,
    scadenza: order.dueDate, cliente: order.customer?.name,
    articoli: order.items.map(i => ({ desc: i.description, qty: Number(i.qty), tecnica: i.technique })),
    produzione: order.productionJobs.map(j => ({ stato: j.status, fasi: j.steps.map(s => ({ tipo: s.stepType, stato: s.status })) })),
    spedizioni: order.shipments.map(s => ({ corriere: s.carrierId, tracking: s.trackingNumber, stato: s.status })),
    ultimeAttivita: order.activities.map(a => ({ chi: a.userName, cosa: a.content, quando: a.createdAt })),
  }
}

async function check_missing_items(orgId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { organizationId: orgId },
    include: { material: true },
  })
  const critical = items.filter(i => Number(i.qtyAvailable) <= Number(i.qtyMinThreshold))
  return critical.map(i => ({
    nome: i.material?.name, disponibile: Number(i.qtyAvailable),
    minimo: Number(i.qtyMinThreshold), unita: i.material?.unit,
    esaurito: Number(i.qtyAvailable) <= 0,
  }))
}

async function get_production_status(orgId: string) {
  const jobs = await prisma.productionJob.findMany({
    where: { organizationId: orgId, status: { in: ['da_iniziare', 'in_corso'] } },
    include: { order: { include: { customer: true } }, steps: true },
    orderBy: [{ isUrgent: 'desc' }, { order: { dueDate: 'asc' } }],
    take: 20,
  })
  return jobs.map(j => ({
    ordine: j.order.code, cliente: j.order.customer?.name,
    stato: j.status, urgente: j.isUrgent, scadenza: j.order.dueDate,
    fasi: j.steps.map(s => ({ tipo: s.stepType, stato: s.status, macchina: s.machineId })),
  }))
}

async function get_machines(orgId: string) {
  const machines = await prisma.machine.findMany({ where: { organizationId: orgId } })
  const inkData = await prisma.inkUsage.findMany({
    where: { organizationId: orgId },
    orderBy: { date: 'desc' },
    take: 20,
  })
  return machines.map(m => {
    const latestInk = inkData.find(i => i.machineId === m.id)
    return {
      nome: m.name, tipo: m.type, stato: m.status, posizione: m.location,
      note: m.notes,
      inchiostri: latestInk ? {
        nero: Number(latestInk.colorBlack), ciano: Number(latestInk.colorCyan),
        magenta: Number(latestInk.colorMagenta), giallo: Number(latestInk.colorYellow),
        metriProdotti: Number(latestInk.metersProduced),
      } : null,
    }
  })
}

async function get_employees(orgId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const employees = await prisma.employee.findMany({
    where: { organizationId: orgId, isActive: true },
    include: {
      attendance: {
        where: { date: { gte: today } },
        take: 1,
      },
    },
  })
  return employees.map(e => ({
    nome: e.name, ruolo: e.role, reparto: e.department,
    costoOrario: Number(e.hourlyRate), oreContrattuali: e.monthlyHours,
    presenzaOggi: e.attendance[0] ? {
      entrata: e.attendance[0].checkIn,
      uscita: e.attendance[0].checkOut,
      ore: Number(e.attendance[0].hoursWorked),
    } : null,
  }))
}

async function get_finance_summary(orgId: string) {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const entries = await prisma.financialEntry.findMany({
    where: { organizationId: orgId, date: { gte: startOfMonth } },
    orderBy: { date: 'desc' },
    take: 50,
  })
  const entrate = entries.filter(e => e.type === 'entrata').reduce((s, e) => s + Number(e.amount), 0)
  const uscite = entries.filter(e => e.type === 'uscita').reduce((s, e) => s + Number(e.amount), 0)
  return { entrate, uscite, margine: entrate - uscite, ultimiMovimenti: entries.slice(0, 10).map(e => ({ tipo: e.type, categoria: e.category, desc: e.description, importo: Number(e.amount), data: e.date })) }
}

async function create_quote(orgId: string, userId: string, customerId: string, items: { description: string; qty: number; unitPrice: number; technique?: string }[], notes?: string) {
  const last = await prisma.quote.findFirst({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' }, select: { code: true } })
  const num = last ? parseInt(last.code.split('-')[1] || '0') + 1 : 1
  const code = `PRE-${num.toString().padStart(3, '0')}`
  const totalAmount = items.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const quote = await prisma.quote.create({
    data: {
      organizationId: orgId, code, customerId, status: 'bozza',
      totalAmount, notes,
      items: { create: items.map(i => ({ ...i, discountPct: 0, total: i.qty * i.unitPrice })) },
    },
    include: { customer: true, items: true },
  })
  return { codice: quote.code, cliente: quote.customer?.name, totale: Number(quote.totalAmount), stato: quote.status }
}

async function get_tasks(orgId: string, assignedToMe?: boolean, userId?: string) {
  const tasks = await prisma.task.findMany({
    where: {
      organizationId: orgId,
      status: { in: ['APERTO', 'IN_CORSO'] },
      ...(assignedToMe && userId ? { assignedTo: userId } : {}),
    },
    orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
    take: 20,
  })
  return tasks.map(t => ({
    titolo: t.title, priorita: t.priority, stato: t.status,
    assegnatoA: t.assignedName, scadenza: t.dueDate,
    ordineCollegato: t.refLabel,
  }))
}

// ─── Tool definitions per Claude ────────────────────────

const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'get_stock',
    description: 'Legge il magazzino. Usa per domande su quantità disponibili, articoli esauriti, posizioni scaffale.',
    input_schema: { type: 'object' as const, properties: { search: { type: 'string', description: 'Cerca per nome articolo (opzionale)' } } },
  },
  {
    name: 'get_orders',
    description: 'Legge gli ordini. Usa per elencare ordini per stato o urgenza.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['nuovo', 'confermato', 'in_produzione', 'completato', 'spedito'] },
        urgent: { type: 'boolean' },
      },
    },
  },
  {
    name: 'get_order_status',
    description: 'Dettaglio completo di un singolo ordine: stato, produzione, spedizione, timeline attività.',
    input_schema: { type: 'object' as const, properties: { code: { type: 'string', description: 'Codice ordine es. ORD-031' } }, required: ['code'] },
  },
  {
    name: 'check_missing_items',
    description: 'Trova articoli esauriti o sotto scorta minima.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_production_status',
    description: 'Stato della produzione: job attivi, fasi, macchine.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_machines',
    description: 'Stato delle macchine e livello inchiostri.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_employees',
    description: 'Dipendenti attivi, presenze di oggi, ore lavorate.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_finance_summary',
    description: 'Riepilogo finanziario del mese: entrate, uscite, margine.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_tasks',
    description: 'Task aperti. Può filtrare per quelli assegnati all\'utente corrente.',
    input_schema: { type: 'object' as const, properties: { assignedToMe: { type: 'boolean' } } },
  },
  {
    name: 'create_quote',
    description: 'Crea un preventivo bozza. Richiede SEMPRE conferma utente prima di eseguire.',
    input_schema: {
      type: 'object' as const,
      properties: {
        customerId: { type: 'string' },
        items: { type: 'array', items: { type: 'object', properties: { description: { type: 'string' }, qty: { type: 'number' }, unitPrice: { type: 'number' }, technique: { type: 'string' } } } },
        notes: { type: 'string' },
      },
      required: ['customerId', 'items'],
    },
  },
]

// ─── API Handler ─────────────────────────────────────────

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const { messages, sessionId } = await req.json()
  if (!messages?.length) return fail('messages richiesto')

  const orgId = ctx.orgId
  const userId = ctx.userId

  const systemPrompt = `Sei l'assistente AI interno di PrintOps Pro, sistema operativo per laboratori di stampa e ricamo.

Sei collegato in TEMPO REALE al database dell'azienda. Puoi leggere stock, ordini, produzione, dipendenti, macchine e finanza.

REGOLE FONDAMENTALI:
1. NON inventare mai dati — usa SEMPRE le funzioni per leggere dati reali
2. Se non trovi un dato con le funzioni → di' "Non trovo questo dato nel sistema"
3. Per azioni che modificano dati (creare preventivo, aggiornare ordine) → chiedi SEMPRE conferma prima
4. Rispondi in italiano, tono professionale ma diretto
5. Sii conciso — il team è in laboratorio, non ha tempo
6. Se una richiesta è ambigua → chiedi chiarimento in una sola domanda

PER I PREVENTIVI usa questi prezzi di riferimento:
- Serigrafia 1 colore: €4/pz, 2-4 colori: €6-8/pz
- Ricamo: €5-9/pz (dipende da punti)
- DTG: €7-12/pz, DTF transfer: €5-7/pz
- Aggiungi sempre IVA 22%
- Sconto quantità: >100pz -5%, >500pz -10%

Sei affidabile, non creativo con i dati.`

  // Agentic loop con tool use
  let currentMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  let response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    tools: TOOLS,
    messages: currentMessages,
  })

  // Loop tool use
  while (response.stop_reason === 'tool_use') {
    const toolUseBlock = response.content.find(b => b.type === 'tool_use') as Anthropic.Messages.ToolUseBlock
    if (!toolUseBlock) break

    const toolName = toolUseBlock.name
    const toolInput = toolUseBlock.input as Record<string, unknown>
    let toolResult: unknown

    try {
      switch (toolName) {
        case 'get_stock':            toolResult = await get_stock(orgId, toolInput.search as string); break
        case 'get_orders':           toolResult = await get_orders(orgId, toolInput.status as string, toolInput.urgent as boolean); break
        case 'get_order_status':     toolResult = await get_order_status(orgId, toolInput.code as string); break
        case 'check_missing_items':  toolResult = await check_missing_items(orgId); break
        case 'get_production_status': toolResult = await get_production_status(orgId); break
        case 'get_machines':         toolResult = await get_machines(orgId); break
        case 'get_employees':        toolResult = await get_employees(orgId); break
        case 'get_finance_summary':  toolResult = await get_finance_summary(orgId); break
        case 'get_tasks':            toolResult = await get_tasks(orgId, toolInput.assignedToMe as boolean, userId); break
        case 'create_quote':
          toolResult = await create_quote(orgId, userId, toolInput.customerId as string, toolInput.items as [], toolInput.notes as string)
          // Log azione AI
          await prisma.aiLog.create({
            data: {
              organizationId: orgId, userId, sessionId: sessionId || 'unknown',
              userMessage: messages[messages.length - 1]?.content || '',
              functionCalled: 'create_quote', functionParams: toolInput,
              functionResult: toolResult as Record<string, unknown>,
              requiredConfirmation: true,
            },
          })
          break
        default: toolResult = { error: 'Funzione non trovata' }
      }
    } catch (e) {
      toolResult = { error: `Errore esecuzione: ${(e as Error).message}` }
    }

    currentMessages = [
      ...currentMessages,
      { role: 'assistant' as const, content: response.content },
      {
        role: 'user' as const,
        content: [{
          type: 'tool_result' as const,
          tool_use_id: toolUseBlock.id,
          content: JSON.stringify(toolResult),
        }],
      },
    ]

    response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages: currentMessages,
    })
  }

  const textContent = response.content.find(b => b.type === 'text') as Anthropic.Messages.TextBlock | undefined
  const reply = textContent?.text || 'Nessuna risposta generata.'

  // Salva log
  await prisma.aiLog.create({
    data: {
      organizationId: orgId, userId, sessionId: sessionId || 'unknown',
      userMessage: messages[messages.length - 1]?.content || '',
      aiResponse: reply,
    },
  })

  return ok({ reply, sessionId })
})
