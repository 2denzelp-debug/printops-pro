'use client'

import { useState, useEffect } from 'react'
import OrderTimeline from '@/components/OrderTimeline'

type Order = {
  id: string; code: string; status: string; isUrgent: boolean
  totalAmount: number; source: string; dueDate?: string; createdAt: string
  customer?: { name: string; company?: string }
  _count?: { items: number }
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  nuovo:         { label: 'Nuovo',         bg: '#f1f0ec', text: '#5f5e5a' },
  confermato:    { label: 'Confermato',     bg: '#dbeafe', text: '#1d4ed8' },
  in_produzione: { label: 'In produzione',  bg: '#fef3c7', text: '#b45309' },
  completato:    { label: 'Completato',     bg: '#dcfce7', text: '#15803d' },
  spedito:       { label: 'Spedito',        bg: '#ccfbf1', text: '#0f766e' },
  annullato:     { label: 'Annullato',      bg: '#fee2e2', text: '#b91c1c' },
}

function Bdg({ s }: { s: string }) {
  const m = STATUS_MAP[s] || { label: s, bg: '#f1f0ec', text: '#5f5e5a' }
  return <span style={{ display: 'inline-flex', padding: '1px 6px', borderRadius: 10, fontSize: 9, fontWeight: 700, background: m.bg, color: m.text }}>{m.label}</span>
}

const FILTERS = ['Tutti', 'Urgenti', 'nuovo', 'confermato', 'in_produzione', 'completato']

export default function OrdiniPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Tutti')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setCurrentUser({ id: d.user.id, name: d.user.name }) })
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'Tutti' && filter !== 'Urgenti') params.set('status', filter)
    if (filter === 'Urgenti') params.set('urgent', 'true')
    if (search) params.set('search', search)
    const r = await fetch(`/api/orders/list?${params}`)
    const d = await r.json()
    setOrders(d.orders || [])
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [filter, search])

  return (
    <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 76px)' }}>

      {/* Lista ordini */}
      <div style={{ flex: selectedOrder ? '0 0 55%' : '1', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Filtri */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca ordine, cliente..."
            style={{ flex: 1, minWidth: 180, border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '7px 10px', fontSize: 12, background: 'var(--card)', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }}
          />
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 11px', fontSize: 11, fontWeight: 500, border: '1px solid var(--border2)', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', background: filter === f ? '#0c0c0a' : 'var(--card)', color: filter === f ? '#fff' : 'var(--ink2)', transition: 'all 0.1s' }}>
              {f}
            </button>
          ))}
          <button onClick={loadOrders} style={{ padding: '5px 12px', fontSize: 11, fontWeight: 500, border: '1px solid var(--border2)', borderRadius: 'var(--r)', cursor: 'pointer', background: 'var(--green)', color: '#fff', fontFamily: 'inherit', borderColor: 'var(--green)' }}>
            + Nuovo
          </button>
        </div>

        {/* Tabella */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', overflow: 'hidden', flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10, color: 'var(--ink3)' }}>
              <div className="spinner" /> Caricamento...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 80 }} /><col /><col style={{ width: 60 }} /><col style={{ width: 70 }} /><col style={{ width: 75 }} /><col style={{ width: 55 }} />
              </colgroup>
              <thead>
                <tr style={{ background: 'var(--card2)' }}>
                  {['Codice', 'Cliente', 'Fonte', 'Scadenza', 'Stato', '€'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '7px 11px', color: 'var(--ink3)', fontWeight: 500, borderBottom: '1px solid var(--border)', fontSize: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--ink3)', fontSize: 12 }}>Nessun ordine trovato</td></tr>
                )}
                {orders.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}
                    style={{ cursor: 'pointer', background: selectedOrder?.id === o.id ? '#f0fdf4' : 'transparent' }}
                  >
                    <td style={{ padding: '8px 11px', fontFamily: 'DM Mono, monospace', fontSize: 10, fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
                      {o.isUrgent && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', marginRight: 3, verticalAlign: 'middle' }} />}
                      {o.code}
                    </td>
                    <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {o.customer?.company || o.customer?.name}
                    </td>
                    <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: o.source === 'shopify' ? '#dcfce7' : o.source === 'woo' ? '#ede9fe' : '#f1f0ec', color: o.source === 'shopify' ? '#14532d' : o.source === 'woo' ? '#4c1d95' : '#5f5e5a' }}>
                        {o.source === 'shopify' ? 'Shopify' : o.source === 'woo' ? 'WooCommerce' : 'Manuale'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)', fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)' }}>
                      {o.dueDate ? new Date(o.dueDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)' }}>
                      <Bdg s={o.status} />
                    </td>
                    <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)', fontFamily: 'DM Mono, monospace', fontWeight: 500, textAlign: 'right' }}>
                      €{Number(o.totalAmount).toLocaleString('it')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Timeline ordine */}
      {selectedOrder && currentUser && (
        <div style={{ flex: '0 0 42%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedOrder.code}</div>
              <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{selectedOrder.customer?.company || selectedOrder.customer?.name}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Bdg s={selectedOrder.status} />
              <button onClick={() => setSelectedOrder(null)} style={{ padding: '3px 8px', fontSize: 10, border: '1px solid var(--border2)', borderRadius: 6, cursor: 'pointer', background: 'transparent', fontFamily: 'inherit' }}>✕</button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <OrderTimeline
              orderId={selectedOrder.id}
              orderCode={selectedOrder.code}
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
            />
          </div>
        </div>
      )}
    </div>
  )
}
