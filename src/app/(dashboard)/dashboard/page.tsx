'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function Bdg({ label, color }: { label: string; color: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    green:  { bg: '#dcfce7', text: '#15803d' },
    amber:  { bg: '#fef3c7', text: '#b45309' },
    red:    { bg: '#fee2e2', text: '#b91c1c' },
    blue:   { bg: '#dbeafe', text: '#1d4ed8' },
    gray:   { bg: '#f1f0ec', text: '#5f5e5a' },
    purple: { bg: '#ede9fe', text: '#6d28d9' },
  }
  const c = colors[color] || colors.gray
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 6px', borderRadius: 10, fontSize: 9, fontWeight: 700, background: c.bg, color: c.text, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  nuovo:         { label: 'Nuovo',         color: 'gray' },
  confermato:    { label: 'Confermato',     color: 'blue' },
  in_produzione: { label: 'In produzione',  color: 'amber' },
  completato:    { label: 'Completato',     color: 'green' },
  spedito:       { label: 'Spedito',        color: 'purple' },
  annullato:     { label: 'Annullato',      color: 'red' },
}

const MACHINE_STATUS: Record<string, { label: string; color: string }> = {
  operativa:    { label: 'Operativa',    color: 'green' },
  guasta:       { label: 'Guasta',       color: 'red' },
  manutenzione: { label: 'Manutenzione', color: 'amber' },
  dismessa:     { label: 'Dismessa',     color: 'gray' },
}

export default function DashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12, color: 'var(--ink3)' }}>
      <div className="spinner" />
      <div style={{ fontSize: 12 }}>Caricamento dashboard...</div>
    </div>
  )

  const stats = (data?.stats as Record<string, number>) || {}
  const orders = (data?.recentOrders as Record<string, unknown>[]) || []
  const stock = (data?.criticalStock as Record<string, unknown>[]) || []
  const machines = (data?.machines as Record<string, unknown>[]) || []

  const metCards = [
    { label: 'Fatturato mese', value: `€${((stats.monthRevenue || 0) as number).toLocaleString('it')}`, sub: '+22% vs mese scorso', subColor: 'var(--green-text)' },
    { label: 'Ordini attivi', value: stats.orderCount || 0, sub: 'in lavorazione', subColor: 'var(--ink3)' },
    { label: 'Urgenti', value: stats.urgentOrders || 0, sub: 'attenzione richiesta', subColor: (stats.urgentOrders || 0) > 0 ? 'var(--red-text)' : 'var(--ink3)' },
    { label: 'Stock critico', value: stats.lowStock || 0, sub: 'articoli esauriti/bassi', subColor: (stats.lowStock || 0) > 0 ? 'var(--amber-text)' : 'var(--ink3)' },
    { label: 'Task aperti', value: stats.openTasks || 0, sub: 'da completare', subColor: 'var(--ink3)' },
  ]

  return (
    <div className="fade-in">
      {/* Metriche */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 8, marginBottom: 14 }}>
        {metCards.map(m => (
          <div key={m.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--ink3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3, fontFamily: 'DM Mono, monospace' }}>{m.value}</div>
            <div style={{ fontSize: 10, marginTop: 2, color: m.subColor }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 12, marginBottom: 12 }}>

        {/* Ordini recenti */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
          <div style={{ padding: '9px 13px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>Ordini recenti</span>
            <Link href="/dashboard/ordini"><button style={{ padding: '3px 8px', fontSize: 10, border: '1px solid var(--border2)', borderRadius: 6, cursor: 'pointer', background: 'var(--card)', color: 'var(--ink)', fontFamily: 'inherit' }}>Vedi tutti</button></Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 75 }} /><col /><col style={{ width: 80 }} /><col style={{ width: 80 }} /><col style={{ width: 55 }} />
            </colgroup>
            <thead>
              <tr style={{ background: 'var(--card2)' }}>
                {['Ordine', 'Cliente', 'Tecnica', 'Stato', '€'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '7px 11px', color: 'var(--ink3)', fontWeight: 500, borderBottom: '1px solid var(--border)', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '16px 11px', textAlign: 'center', color: 'var(--ink3)', fontSize: 11 }}>Nessun ordine</td></tr>
              )}
              {orders.map((o) => {
                const st = STATUS_MAP[(o.status as string)] || { label: o.status as string, color: 'gray' }
                const customer = o.customer as { name: string; company?: string }
                return (
                  <tr key={o.id as string} onClick={() => {}} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '8px 11px', fontFamily: 'DM Mono, monospace', fontSize: 10, fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
                      {o.isUrgent && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', marginRight: 3, verticalAlign: 'middle' }} />}
                      {o.code as string}
                    </td>
                    <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {customer?.company || customer?.name}
                    </td>
                    <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)' }}>
                      <Bdg label={(o.source as string)} color="gray" />
                    </td>
                    <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)' }}>
                      <Bdg label={st.label} color={st.color} />
                    </td>
                    <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)', fontFamily: 'DM Mono, monospace', fontWeight: 500, textAlign: 'right' }}>
                      €{Number(o.totalAmount).toLocaleString('it')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Stock critico */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
            <div style={{ padding: '9px 13px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>Stock critico</span>
              <Link href="/dashboard/magazzino"><button style={{ padding: '3px 8px', fontSize: 10, border: '1px solid var(--border2)', borderRadius: 6, cursor: 'pointer', background: 'var(--card)', color: 'var(--ink)', fontFamily: 'inherit' }}>Magazzino</button></Link>
            </div>
            {stock.length === 0 ? (
              <div style={{ padding: '14px 13px', fontSize: 11, color: 'var(--ink3)', textAlign: 'center' }}>✅ Tutto nella norma</div>
            ) : stock.slice(0, 6).map((item: Record<string, unknown>) => {
              const mat = item.material as { name: string; unit: string } | null
              const qty = Number(item.qtyAvailable)
              const loc = item.location as { label: string } | null
              return (
                <div key={item.id as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 13px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat?.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--ink3)' }}>{loc?.label}</div>
                  </div>
                  <Bdg label={qty <= 0 ? 'ESAURITO' : `${qty} ${mat?.unit}`} color={qty <= 0 ? 'red' : 'amber'} />
                </div>
              )
            })}
          </div>

          {/* Macchine */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
            <div style={{ padding: '9px 13px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>Macchine</div>
            {machines.slice(0, 5).map((m: Record<string, unknown>) => {
              const st = MACHINE_STATUS[(m.status as string)] || { label: m.status as string, color: 'gray' }
              return (
                <div key={m.id as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 13px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: st.color === 'green' ? 'var(--green)' : st.color === 'red' ? 'var(--red)' : 'var(--amber)' }} />
                  <div style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name as string}</div>
                  <Bdg label={st.label} color={st.color} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8 }}>
        {[
          { href: '/dashboard/ordini', icon: '📋', label: 'Nuovo ordine' },
          { href: '/dashboard/preventivi', icon: '📄', label: 'Nuovo preventivo' },
          { href: '/dashboard/team', icon: '💬', label: 'Team Chat' },
          { href: '/dashboard/ai', icon: '✦', label: 'Chiedi all\'AI' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'border 0.1s' }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)' }}>{a.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
