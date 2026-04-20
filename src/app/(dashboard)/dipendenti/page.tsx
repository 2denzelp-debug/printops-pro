'use client'
import { useState } from 'react'

const EMPLOYEES = [
  { id:1,name:'Giulia Mancini',role:'Operatrice stampa',dept:'Produzione',rate:16,hours:168,status:'presente',entry:'08:02' },
  { id:2,name:'Marco Ferretti',role:'Ricamatore',dept:'Produzione',rate:18,hours:152,status:'presente',entry:'08:15' },
  { id:3,name:'Sara Romano',role:'Grafica',dept:'Reparto Grafico',rate:20,hours:160,status:'assente',entry:'—' },
  { id:4,name:'Andrea Conti',role:'Magazziniere',dept:'Magazzino',rate:14,hours:168,status:'presente',entry:'07:55' },
  { id:5,name:'Elisa Galli',role:'Commerciale',dept:'Vendite',rate:22,hours:140,status:'presente',entry:'09:00' },
]

function initials(n: string) { return n.split(' ').map(w=>w[0]).join('').toUpperCase() }

export default function DipendentiPage() {
  const [selected, setSelected] = useState<typeof EMPLOYEES[0]|null>(null)
  const totalCost = EMPLOYEES.reduce((a,e)=>a+e.rate*e.hours,0)

  return (
    <div style={{ display:'flex',gap:12,height:'calc(100vh - 76px)' }}>
      <div style={{ flex:selected?'0 0 62%':'1',display:'flex',flexDirection:'column',minWidth:0 }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:12 }}>
          {[['Dipendenti',EMPLOYEES.length,'var(--ink)'],['Presenti oggi',EMPLOYEES.filter(e=>e.status==='presente').length,'var(--green-text)'],['Costo mensile','€'+totalCost.toLocaleString('it'),'var(--ink)'],['Ore medie',Math.round(EMPLOYEES.reduce((a,e)=>a+e.hours,0)/EMPLOYEES.length)+'h','var(--ink)']].map(([l,v,c]) => (
            <div key={l as string} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px' }}>
              <div style={{ fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4 }}>{l as string}</div>
              <div style={{ fontSize:20,fontWeight:600,fontFamily:'DM Mono,monospace',color:c as string }}>{v as string}</div>
            </div>
          ))}
        </div>

        <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden',flex:1,overflowY:'auto' }}>
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed' }}>
            <colgroup><col/><col style={{ width:90 }}/><col style={{ width:80 }}/><col style={{ width:65 }}/><col style={{ width:65 }}/><col style={{ width:80 }}/><col style={{ width:80 }}/></colgroup>
            <thead><tr style={{ background:'var(--card2)' }}>
              {['Nome','Ruolo','Reparto','€/ora','Ore/mese','Costo mens.','Presenza'].map(h=><th key={h} style={{ textAlign:'left',padding:'7px 11px',color:'var(--ink3)',fontWeight:500,borderBottom:'1px solid var(--border)',fontSize:10 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {EMPLOYEES.map(e => (
                <tr key={e.id} onClick={() => setSelected(selected?.id===e.id?null:e)} style={{ cursor:'pointer',background:selected?.id===e.id?'#f0fdf4':'transparent' }}>
                  <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <div style={{ width:26,height:26,borderRadius:'50%',background:e.status==='presente'?'#dcfce7':'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:600,color:e.status==='presente'?'#15803d':'#b91c1c',flexShrink:0 }}>{initials(e.name)}</div>
                      <div style={{ fontWeight:500 }}>{e.name}</div>
                    </div>
                  </td>
                  <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)',color:'var(--ink2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{e.role}</td>
                  <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)' }}><span style={{ fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f1f0ec',color:'#5f5e5a' }}>{e.dept}</span></td>
                  <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace' }}>€{e.rate}/h</td>
                  <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace' }}>{e.hours}h</td>
                  <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontWeight:500 }}>€{(e.rate*e.hours).toLocaleString('it')}</td>
                  <td style={{ padding:'8px 11px',borderBottom:'1px solid var(--border)' }}>
                    <span style={{ display:'inline-flex',padding:'1px 6px',borderRadius:10,fontSize:9,fontWeight:700,background:e.status==='presente'?'#dcfce7':'#fee2e2',color:e.status==='presente'?'#15803d':'#b91c1c' }}>{e.status==='presente'?'▸ '+e.entry:'Assente'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div style={{ flex:'0 0 35%',background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden',display:'flex',flexDirection:'column' }}>
          <div style={{ padding:'12px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:38,height:38,borderRadius:'50%',background:selected.status==='presente'?'#dcfce7':'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,color:selected.status==='presente'?'#15803d':'#b91c1c' }}>{initials(selected.name)}</div>
              <div><div style={{ fontSize:14,fontWeight:600 }}>{selected.name}</div><div style={{ fontSize:11,color:'var(--ink3)' }}>{selected.role} · {selected.dept}</div></div>
            </div>
            <button onClick={() => setSelected(null)} style={{ padding:'3px 8px',fontSize:10,border:'1px solid var(--border2)',borderRadius:6,cursor:'pointer',background:'transparent',fontFamily:'inherit' }}>✕</button>
          </div>
          <div style={{ padding:14,flex:1,overflowY:'auto' }}>
            {[['💼','Ruolo',selected.role],['🏢','Reparto',selected.dept],['⏰','Presenza oggi',selected.status==='presente'?'In servizio — Entrata '+selected.entry:'Assente'],['💶','Costo orario','€'+selected.rate+'/ora'],['📅','Ore mensili',selected.hours+'h'],['💰','Costo mensile','€'+(selected.rate*selected.hours).toLocaleString('it')]].map(([icon,label,val]) => (
              <div key={label as string} style={{ display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:14 }}>{icon as string}</span>
                <div><div style={{ fontSize:10,color:'var(--ink3)' }}>{label as string}</div><div style={{ fontSize:12,fontWeight:500 }}>{val as string}</div></div>
              </div>
            ))}
            <div style={{ marginTop:14,display:'flex',gap:6 }}>
              <button style={{ flex:1,padding:'8px',fontSize:11,fontWeight:500,background:'var(--card2)',border:'1px solid var(--border2)',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit' }}>📊 Ore</button>
              <button style={{ flex:1,padding:'8px',fontSize:11,fontWeight:500,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit' }}>✏️ Modifica</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
