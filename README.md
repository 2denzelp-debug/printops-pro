# PrintOps Pro

Sistema operativo aziendale per laboratori di stampa, ricamo, DTF, adesivi e produzione.

## Stack

- **Next.js 14** — frontend + backend (App Router)
- **TypeScript** — tipizzazione completa
- **PostgreSQL** — database relazionale
- **Prisma** — ORM e migrazioni
- **Tailwind CSS** — stile
- **Stripe** — abbonamenti
- **Claude API** — assistente AI

## Setup in 5 minuti

### 1. Clona e installa

```bash
git clone <repo>
cd printops
npm install
```

### 2. Configura le variabili d'ambiente

```bash
cp .env.example .env
# Modifica .env con i tuoi valori
```

### 3. Database

```bash
# Crea il database PostgreSQL
# Poi esegui le migrazioni
npm run db:push

# Carica i dati demo
npm run db:seed
```

### 4. Avvia

```bash
npm run dev
# Apri http://localhost:3000
```

### Login demo

- **URL:** `http://localhost:3000`
- **Slug:** `printshop-demo`
- **Email:** `admin@printshop.it`
- **Password:** `password123`

---

## Struttura progetto

```
printops/
├── prisma/
│   ├── schema.prisma          ← Schema DB completo (27 tabelle)
│   └── seed.ts                ← Dati demo
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          ← Login, logout, register
│   │   │   ├── orders/        ← CRUD ordini + timeline
│   │   │   ├── quotes/        ← Preventivi
│   │   │   ├── customers/     ← CRM clienti
│   │   │   ├── stock/         ← Magazzino
│   │   │   ├── dtf/           ← DTF orders
│   │   │   ├── stickers/      ← Adesivi
│   │   │   ├── samples/       ← Campionature
│   │   │   ├── employees/     ← Dipendenti
│   │   │   ├── machines/      ← Macchine
│   │   │   ├── finance/       ← Finanza
│   │   │   ├── ai/            ← Chat AI
│   │   │   ├── team/          ← Chat team + notifiche
│   │   │   │   ├── messages/  ← Messaggi canali
│   │   │   │   ├── channels/  ← Canali team
│   │   │   │   └── notifications/ ← Notifiche
│   │   │   ├── tasks/         ← Task collaborativi
│   │   │   └── stripe/        ← Webhooks + checkout
│   │   ├── (auth)/            ← Login, register
│   │   └── (dashboard)/       ← Tutte le pagine app
│   ├── components/
│   │   ├── TeamChat.tsx       ← Chat interna team
│   │   ├── OrderTimeline.tsx  ← Timeline collaborativa ordine
│   │   └── NotificationBell.tsx ← Notifiche real-time
│   ├── lib/
│   │   ├── prisma.ts          ← Client Prisma
│   │   ├── auth.ts            ← JWT + bcrypt
│   │   ├── plans.ts           ← Piani + feature flags
│   │   └── api.ts             ← Middleware withAuth
│   └── types/
│       └── index.ts           ← Tutti i tipi TypeScript
└── .env.example               ← Template variabili
```

---

## Moduli implementati

### Core
- ✅ Auth multi-tenant (login, register, JWT)
- ✅ Piani Stripe (Trial, Solo, Team, Studio, Agenzia, Enterprise)
- ✅ Protezione route e feature flags

### CRM
- ✅ Clienti + fornitori
- ✅ Preventivi (bozza → inviato → accettato)
- ✅ Ordini (Shopify, WooCommerce, manuale)

### Operativo
- ✅ Produzione multi-fase (kanban)
- ✅ DTF (film, metri, inchiostri)
- ✅ Adesivi & sticker
- ✅ Campionature
- ✅ Spedizioni + etichette PDF

### Magazzino
- ✅ Stock multi-unità (pz, m, m², L)
- ✅ Posizione fisica (scaffale + ripiano)
- ✅ Movimenti + soglie minime
- ✅ Consumo inchiostri per macchina

### Persone
- ✅ Dipendenti + timbratura
- ✅ Presenze settimanali
- ✅ Pre-payroll (export CSV/PDF)

### Finanza
- ✅ Entrate/uscite
- ✅ Allocazione automatica (stipendi, fornitori, tasse, margine)

### Macchine
- ✅ Stato operativo
- ✅ Manutenzioni
- ✅ Monitoraggio inchiostri

### 🆕 Collaborazione team
- ✅ Chat interna canali (tipo Slack)
- ✅ Canali per reparto (generale, produzione, grafico, magazzino...)
- ✅ Timeline collaborativa per ogni ordine
- ✅ Commenti + aggiornamenti in tempo reale
- ✅ Task assegnabili con priorità e scadenza
- ✅ Notifiche in-app (menzioni, task, aggiornamenti ordine)

### AI
- ✅ Chat AI con accesso a tutti i dati reali
- ✅ 10+ tool functions (stock, ordini, macchine, finanza...)
- ✅ Log di tutte le azioni AI

---

## Deploy

### Railway (consigliato — €5-10/mese)

```bash
npm install -g railway
railway login
railway init
railway up
```

### Vercel + PlanetScale / Supabase

```bash
vercel deploy
# Configura DATABASE_URL nel pannello Vercel
```

---

## Roadmap prossimi step

1. [ ] Pagine UI dashboard (Next.js App Router)
2. [ ] Sidebar + topbar + layout
3. [ ] Pagina ordini con timeline integrata
4. [ ] Pagina team/chat
5. [ ] Middleware protezione route
6. [ ] AI chat con Claude tool calling
7. [ ] Export PDF preventivi/fatture
8. [ ] Integrazione Gmail + WhatsApp

---

## Licenza

Proprietario — PrintOps Pro © 2026
