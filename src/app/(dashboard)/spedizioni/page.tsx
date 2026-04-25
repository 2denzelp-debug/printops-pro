'use client'
import { useState } from 'react'

const SHIPS = [
  { id:'SHP-015',ord:'ORD-028',cli:'Dario Ricci',corriere:'GLS',track:'GLS9182736455',status:'consegnata',data:'13 apr',colli:2,peso:'4.5 kg' },
  { id:'SHP-014',ord:'ORD-027',cli:'FitZone srl',corriere:'DHL',track:'DHL4567890123',status:'in_transito',data:'14 apr',colli:3,peso:'8.2 kg' },
  { id:'SHP-013',ord:'ORD-031',cli:'Marco Rossi',corriere:'—',track:'—',status:'da_preparare',data:'—',colli:1,peso:'3.1 kg' },
  { id:'SHP-012',ord:'ORD-030',cli:'Anna Conti',corriere:'BRT',track:'—',status:'pronta',data:'—',colli:5,peso:'14.0 kg' },
  { id:'SHP-011',ord:'ORD-029',cli:'Sara Bianchi',corriere:'UPS',track:'1Z9999W9',status:'spedita',data:'12 apr',colli:1,peso:'2.0 kg' },
]

type Ship = typeof SHIPS[0]

const SM: Record<string,{bg:string,text:string,label:string}> = {
  da_preparare:{bg:'#f1f0ec',text:'#5f5e5a',label:'Da preparare'},
  pronta:{bg:'#fef3c7',text:'#b45309',label:'Pronta'},
  spedita:{bg:'#dbeafe',text:'#1d4ed8',label:'Spedita'},
  in_transito:{bg:'#ede9fe',text:'#6d28d9',label:'In transito'},
  consegnata:{bg:'#dcfce7',text:'#15803d',label:'Consegnata'},
}

export default function SpedizioniPage() {
  const [selected, setSelected] = useState<Ship|null>(null)

  return (
    <div style={{display:'flex',gap:12,height:'calc(100vh - 76px)'}}>
      <div style={{flex:selected?'0 0 60%':'1',display:'flex',flexDirection:'column',minWidth:0}}>
        <div style={{display:'flex',gap:8,marginBottom:10,alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:12,color:'var(--ink3)'}}>{SHIPS.length} spedizioni</div>
          <button style={{padding:'5px 12px',fontSize:11,fontWeight:600,background:'var(--green)',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>+ Nuova</button>
        </div>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden',flex:1,overflowY:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed'}}>
            <colgroup><col style={{width:70}}/><col style={{width:80}}/><col/><col style={{width:60}}/><col style={{width:120}}/><col style={{width:80}}/></colgroup>
            <thead><tr style={{background:'var(--card2)'}}>
              {['ID','Ordine','Cliente','Colli','Tracking','Stato'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 11px',color:'var(--ink3)',fontWeight:500,borderBottom:'1px solid var(--border)',fontSize:10}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {SHIPS.map(s=>{
                const sm=SM[s.status]||SM.da_preparare
                return(
                  <tr key={s.id} onClick={()=>setSelected(selected?.id===s.id?null:s)} style={{cursor:'pointer',background:selected?.id===s.id?'#f0fdf4':'transparent'}}>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontSize:10,fontWeight:500}}>{s.id}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontSize:10}}>{s.ord}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.cli}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',textAlign:'center'}}>{s.colli}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontSize:10,color:'var(--ink3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.track}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><span style={{display:'inline-flex',padding:'1px 6px',borderRadius:10,fontSize:9,fontWeight:700,background:sm.bg,color:sm.text}}>{sm.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selected && (
        <div style={{flex:'0 0 37%',background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div><div style={{fontSize:14,fontWeight:600}}>{selected.id}</div><div style={{fontSize:11,color:'var(--ink3)'}}>{selected.ord} · {selected.cli}</div></div>
            <button onClick={()=>setSelected(null)} style={{padding:'3px 8px',fontSize:10,border:'1px solid var(--border2)',borderRadius:6,cursor:'pointer',background:'transparent',fontFamily:'inherit'}}>✕</button>
          </div>
          <div style={{padding:14,flex:1,overflowY:'auto'}}>
            {[['📦','Corriere',selected.corriere],['🔍','Tracking',selected.track],['📅','Data',selected.data],['📦','Colli',String(selected.colli)],['⚖️','Peso',selected.peso]].map(([icon,label,val])=>(
              <div key={label} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{fontSize:14}}>{icon}</span>
                <div><div style={{fontSize:10,color:'var(--ink3)'}}>{label}</div><div style={{fontSize:12,fontWeight:500}}>{val}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
