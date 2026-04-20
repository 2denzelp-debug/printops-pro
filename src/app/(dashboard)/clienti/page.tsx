'use client'

import { useState, useEffect } from 'react'

type Customer = {
  id: string; code: string; name: string; company?: string
  email?: string; phone?: string; whatsapp?: string; city?: string
  status: string; orderCount: number; totalSpent: number
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  attivo:   { bg: '#dcfce7', text: '#15803d' },
  lead:     { bg: '#dbeafe', text: '#1d4ed8' },
  inattivo: { bg: '#f1f0ec', text: '#5f5e5a' },
}

function initials(name: string) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }

export default function ClientiPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('tutti')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', whatsapp: '', city: '', status: 'attivo' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [search, filter])

  async function load() {
    setLoading(true)
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (filter !== 'tutti') p.set('status', filter)
    const r = await fetch('/api/customers/list?' + p)
    const d = await r.json()
    setCustomers(d.customers || [])
    setLoading(false)
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/customers/list', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setShowForm(false)
    setForm({ name: '', company: '', email: '', phone: '', whatsapp: '', city: '', status: 'attivo' })
    load()
  }

  const inp: React.CSSProperties = { width: '100%', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '7px 10px', fontSize: 12, background: 'var(--card)', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 76px)' }}>
      <div style={{ flex: selected ? '0 0 60%' : '1', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca nome, azienda, email..." style={{ ...inp, flex: 1, minWidth: 180 }} />
          {['tutti','attivo','lead','inattivo'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 11px', fontSize: 11, fontWeight: 500, border: '1px solid var(--border2)', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', background: filter===f ? '#0c0c0a' : 'var(--card)', color: filter===f ? '#fff' : 'var(--ink2)', textTransform: 'capitalize' }}>{f}</button>
          ))}
          <button onClick={() => setShowForm(true)} style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'inherit' }}>+ Nuovo</button>
        </div>

        {showForm && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Nuovo cliente</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[['name','Nome *','Mario Rossi'],['company','Azienda','Rossi Events'],['email','Email','mario@rossi.it'],['phone','Telefono','+39 333 000 0000'],['whatsapp','WhatsApp','+39 333 000 0000'],['city','Città','Milano']].map(([k,l,ph]) => (
                <div key={k}><div style={{ fontSize: 10, color: 'var(--ink3)', marginBottom: 3 }}>{l}</div><input style={inp} placeholder={ph} value={(form as Record<string,string>)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '6px 14px', fontSize: 12, border: '1px solid var(--border2)', borderRadius: 'var(--r)', cursor: 'pointer', background: 'transparent', fontFamily: 'inherit' }}>Annulla</button>
              <button onClick={save} disabled={saving} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, background: '#0c0c0a', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Salvo...' : 'Salva'}</button>
            </div>
          </div>
        )}

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', overflow: 'hidden', flex: 1, overflowY: 'auto' }}>
          {loading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10, color: 'var(--ink3)' }}><div className="spinner" /> Caricamento...</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, tableLayout: 'fixed' }}>
              <colgroup><col style={{ width: 200 }} /><col /><col style={{ width: 100 }} /><col style={{ width: 60 }} /><col style={{ width: 80 }} /><col style={{ width: 70 }} /></colgroup>
              <thead><tr style={{ background: 'var(--card2)' }}>
                {['Cliente','Contatto','Città','Ordini','Speso','Stato'].map(h => <th key={h} style={{ textAlign: 'left', padding: '7px 11px', color: 'var(--ink3)', fontWeight: 500, borderBottom: '1px solid var(--border)', fontSize: 10 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {customers.length === 0 && <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--ink3)' }}>Nessun cliente</td></tr>}
                {customers.map(c => {
                  const sc = STATUS_COLORS[c.status] || STATUS_COLORS.inattivo
                  return (
                    <tr key={c.id} onClick={() => setSelected(selected?.id===c.id ? null : c)} style={{ cursor: 'pointer', background: selected?.id===c.id ? '#f0fdf4' : 'transparent' }}>
                      <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e6f1fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: '#0c447c', flexShrink: 0 }}>{initials(c.name)}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                            {c.company && <div style={{ fontSize: 10, color: 'var(--ink3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)', fontSize: 10, color: 'var(--ink3)' }}>
                        {c.email && <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>}
                        {c.phone && <div>{c.phone}</div>}
                      </td>
                      <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.city || '—'}</td>
                      <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)', fontFamily: 'DM Mono, monospace', textAlign: 'center' }}>{c.orderCount}</td>
                      <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>€{c.totalSpent.toLocaleString('it')}</td>
                      <td style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)' }}><span style={{ display: 'inline-flex', padding: '1px 6px', borderRadius: 10, fontSize: 9, fontWeight: 700, background: sc.bg, color: sc.text }}>{c.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <div style={{ flex: '0 0 37%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e6f1fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#0c447c' }}>{initials(selected.name)}</div>
              <div><div style={{ fontSize: 14, fontWeight: 600 }}>{selected.name}</div><div style={{ fontSize: 11, color: 'var(--ink3)' }}>{selected.company}</div></div>
            </div>
            <button onClick={() => setSelected(null)} style={{ padding: '3px 8px', fontSize: 10, border: '1px solid var(--border2)', borderRadius: 6, cursor: 'pointer', background: 'transparent', fontFamily: 'inherit' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
            {[['Ordini', selected.orderCount],['Speso', '€'+selected.totalSpent.toLocaleString('it')],['Stato', selected.status]].map(([l,v]) => (
              <div key={l as string} style={{ padding: '10px 14px', borderRight: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{v as string}</div>
                <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 2 }}>{l as string}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 14, flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Contatti</div>
            {[['📧','Email',selected.email],['📱','Telefono',selected.phone],['💬','WhatsApp',selected.whatsapp],['📍','Città',selected.city]].map(([icon,label,val]) => val && (
              <div key={label as string} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14 }}>{icon as string}</span>
                <div><div style={{ fontSize: 10, color: 'var(--ink3)' }}>{label as string}</div><div style={{ fontSize: 12 }}>{val as string}</div></div>
              </div>
            ))}
            <div style={{ marginTop: 14, display: 'flex', gap: 6 }}>
              <button style={{ flex: 1, padding: '8px', fontSize: 11, fontWeight: 500, background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'inherit' }}>📋 Ordini</button>
              <button style={{ flex: 1, padding: '8px', fontSize: 11, fontWeight: 500, background: '#0c0c0a', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'inherit' }}>📄 Preventivo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
