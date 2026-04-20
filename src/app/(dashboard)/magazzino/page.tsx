'use client'
import { useState, useEffect } from 'react'

type Item = { id: string; qtyAvailable: number; qtyMinThreshold: number; material?: { name: string; category: string; unit: string }; location?: { label: string; zone: string }; warehouse?: { name: string } }

export default function MagazzinoPage() {
  const [items, setItems] = useState<Item[]>([])
  const [stats, setStats] = useState<Record<string,unknown>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [movModal, setMovModal] = useState<Item | null>(null)
  const [movForm, setMovForm] = useState({ type: 'carico', qty: '', notes: '' })

  useEffect(() => { load() }, [search, filter])

  async function load() {
    setLoading(true)
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (filter !== 'all') p.set('filter', filter)
    const r = await fetch('/api/stock/list?' + p)
    const d = await r.json()
    setItems(d.items || [])
    setStats(d.stats || {})
    setLoading(false)
  }

  async function doMovement() {
    if (!movModal || !movForm.qty) return
    await fetch('/api/stock/list', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inventoryItemId: movModal.id, ...movForm, qty: Number(movForm.qty) }) })
    setMovModal(null); setMovForm({ type: 'carico', qty: '', notes: '' }); load()
  }

  const inp: React.CSSProperties = { width: '100%', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '7px 10px', fontSize: 12, background: 'var(--card)', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8, marginBottom: 14 }}>
        {[['Articoli totali', stats.total||0, 'var(--ink)'],['Esauriti', stats.outOfStock||0, 'var(--red-text)'],['Sotto scorta', stats.lowStock||0, 'var(--amber-text)'],['Categorie', (stats.categories as string[]|undefined)?.length||0, 'var(--ink)']].map(([l,v,c]) => (
          <div key={l as string} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{l as string}</div>
            <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'DM Mono, monospace', color: c as string }}>{v as string}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca articolo..." style={{ ...inp, flex: 1, minWidth: 180 }} />
        {[['all','Tutti'],['low','Sotto scorta'],['out','Esauriti']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: '5px 11px', fontSize: 11, fontWeight: 500, border: '1px solid var(--border2)', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', background: filter===v ? '#0c0c0a' : 'var(--card)', color: filter===v ? '#fff' : 'var(--ink2)' }}>{l}</button>
        ))}
      </div>

      {loading ? <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:200,gap:10,color:'var(--ink3)' }}><div className="spinner"/>Caricamento...</div> : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, tableLayout: 'fixed' }}>
            <colgroup><col /><col style={{ width: 90 }} /><col style={{ width: 120 }} /><col style={{ width: 80 }} /><col style={{ width: 90 }} /><col style={{ width: 80 }} /></colgroup>
            <thead><tr style={{ background: 'var(--card2)' }}>
              {['Articolo','Categoria','Posizione','Disponibile','Minimo','Azioni'].map(h => <th key={h} style={{ textAlign:'left',padding:'7px 11px',color:'var(--ink3)',fontWeight:500,borderBottom:'1px solid var(--border)',fontSize:10 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={6} style={{ padding:'24px',textAlign:'center',color:'var(--ink3)' }}>Nessun articolo</td></tr>}
              {items.map(item => {
                const qty = Number(item.qtyAvailable)
                const min = Number(item.qtyMinThreshold)
                const color = qty<=0 ? 'var(--red)' : qty<=min ? 'var(--amber)' : 'var(--green)'
                const pct = Math.min(100, min>0 ? Math.round(qty/(min*2)*100) : 100)
                return (
                  <tr key={item.id}>
                    <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)',fontWeight:500 }}>{item.material?.name}</td>
                    <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)',color:'var(--ink3)',fontSize:10 }}>{item.material?.category}</td>
                    <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)',fontSize:10,color:'var(--ink3)' }}>{item.location?.zone}{item.location?.label ? ' · '+item.location.label : ''}</td>
                    <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                        <div style={{ fontFamily:'DM Mono,monospace',fontWeight:600,color }}>{qty<=0?'ESAURITO':qty+' '+(item.material?.unit||'')}</div>
                      </div>
                      <div style={{ height:3,background:'var(--surface)',borderRadius:2,overflow:'hidden',marginTop:3,width:60 }}><div style={{ height:'100%',background:color,width:pct+'%',borderRadius:2 }}/></div>
                    </td>
                    <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontSize:10,color:'var(--ink3)' }}>{min} {item.material?.unit}</td>
                    <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)' }}>
                      <button onClick={() => setMovModal(item)} style={{ padding:'3px 8px',fontSize:10,border:'1px solid var(--border2)',borderRadius:5,cursor:'pointer',background:'var(--card)',fontFamily:'inherit' }}>± Stock</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {movModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999 }}>
          <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:24,width:360 }}>
            <div style={{ fontSize:14,fontWeight:600,marginBottom:4 }}>Movimento stock</div>
            <div style={{ fontSize:12,color:'var(--ink3)',marginBottom:16 }}>{movModal.material?.name}</div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:10,color:'var(--ink3)',marginBottom:4 }}>Tipo</div>
              <select value={movForm.type} onChange={e => setMovForm(p=>({...p,type:e.target.value}))} style={{ ...inp }}>
                <option value="carico">Carico (+)</option>
                <option value="scarico">Scarico (−)</option>
                <option value="rettifica">Rettifica (imposta valore)</option>
              </select>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:10,color:'var(--ink3)',marginBottom:4 }}>Quantità ({movModal.material?.unit})</div>
              <input type="number" min="0" step="0.1" value={movForm.qty} onChange={e => setMovForm(p=>({...p,qty:e.target.value}))} style={inp} placeholder="es. 50" />
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10,color:'var(--ink3)',marginBottom:4 }}>Note (opzionale)</div>
              <input value={movForm.notes} onChange={e => setMovForm(p=>({...p,notes:e.target.value}))} style={inp} placeholder="es. Ricevuta da fornitore" />
            </div>
            <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
              <button onClick={() => setMovModal(null)} style={{ padding:'7px 14px',fontSize:12,border:'1px solid var(--border2)',borderRadius:'var(--r)',cursor:'pointer',background:'transparent',fontFamily:'inherit' }}>Annulla</button>
              <button onClick={doMovement} style={{ padding:'7px 14px',fontSize:12,fontWeight:600,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit' }}>Conferma</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
