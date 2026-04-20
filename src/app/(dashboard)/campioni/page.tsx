'use client'
import { useState } from 'react'

const CAMPIONI = [
  { id:'CAM-012',cli:'Anna Conti',desc:'Campione ricamo logo su polo',tech:'Ricamo',status:'approvato',data:'10 apr',costo:25,note:'Cliente soddisfatta — confermato ORD-030',ordCollegato:'ORD-030' },
  { id:'CAM-011',cli:'Sport Club',desc:'Test stampa DTF su jersey calcio',tech:'DTF',status:'in_lavorazione',data:'13 apr',costo:15,note:'In attesa feedback cliente',ordCollegato:null },
  { id:'CAM-010',cli:'Nuovo Lead',desc:'Campione serigrafia 3 colori su hoodie',tech:'Serigrafia',status:'inviato',data:'12 apr',costo:20,note:'Inviato per approvazione',ordCollegato:null },
  { id:'CAM-009',cli:'FitZone',desc:'Test colori canotta sport',tech:'Serigrafia',status:'rifiutato',data:'08 apr',costo:18,note:'Cliente vuole colori diversi — rifare',ordCollegato:null },
  { id:'CAM-008',cli:'Rossi Events',desc:'Campione tote bag serigrafia',tech:'Serigrafia',status:'approvato',data:'05 apr',costo:22,note:'Approvato — in attesa ordine',ordCollegato:null },
]
const SM: Record<string,{bg:string,text:string,label:string}> = {
  in_lavorazione:{bg:'#fef3c7',text:'#b45309',label:'In lavorazione'},
  inviato:{bg:'#dbeafe',text:'#1d4ed8',label:'Inviato'},
  approvato:{bg:'#dcfce7',text:'#15803d',label:'Approvato'},
  rifiutato:{bg:'#fee2e2',text:'#b91c1c',label:'Rifiutato'},
}

export default function CampioniPage() {
  const [filter, setFilter] = useState('tutti')
  const [showForm, setShowForm] = useState(false)
  const filtered = filter==='tutti' ? CAMPIONI : CAMPIONI.filter(c=>c.status===filter)
  const inp: React.CSSProperties = {width:'100%',border:'1px solid var(--border2)',borderRadius:'var(--r)',padding:'7px 10px',fontSize:12,background:'var(--card)',color:'var(--ink)',outline:'none',fontFamily:'inherit'}

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14}}>
        {[['Totale campioni',CAMPIONI.length,'var(--ink)'],
          ['Approvati',CAMPIONI.filter(c=>c.status==='approvato').length,'var(--green-text)'],
          ['In lavorazione',CAMPIONI.filter(c=>c.status==='in_lavorazione'||c.status==='inviato').length,'var(--amber-text)'],
          ['Costo totale','€'+CAMPIONI.reduce((a,c)=>a+c.costo,0),'var(--ink)'],
        ].map(([l,v,c])=>(
          <div key={l as string} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px'}}>
            <div style={{fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{l as string}</div>
            <div style={{fontSize:22,fontWeight:600,fontFamily:'DM Mono,monospace',color:c as string}}>{v as string|number}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:6,marginBottom:10,alignItems:'center',flexWrap:'wrap'}}>
        {['tutti','in_lavorazione','inviato','approvato','rifiutato'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'4px 10px',fontSize:11,fontWeight:500,border:'1px solid var(--border2)',borderRadius:20,cursor:'pointer',fontFamily:'inherit',background:filter===f?'#0c0c0a':'var(--card)',color:filter===f?'#fff':'var(--ink2)',textTransform:'capitalize'}}>{f.replace('_',' ')}</button>
        ))}
        <button onClick={()=>setShowForm(!showForm)} style={{marginLeft:'auto',padding:'5px 12px',fontSize:11,fontWeight:600,background:'var(--green)',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>+ Nuovo campione</button>
      </div>

      {showForm && (
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:14,marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Nuovo campione</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
            {[['Cliente','es. Marco Rossi'],['Descrizione','es. Test ricamo logo'],['Tecnica','es. Ricamo, DTF, Serigrafia'],['Costo stimato (€)','es. 20']].map(([l,ph])=>(
              <div key={l}><div style={{fontSize:10,color:'var(--ink3)',marginBottom:3}}>{l}</div><input style={inp} placeholder={ph}/></div>
            ))}
          </div>
          <div style={{marginBottom:10}}><div style={{fontSize:10,color:'var(--ink3)',marginBottom:3}}>Note</div><textarea style={{...inp,minHeight:50,resize:'none'}} placeholder="Note interne sul campione..."/></div>
          <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
            <button onClick={()=>setShowForm(false)} style={{padding:'6px 14px',fontSize:12,border:'1px solid var(--border2)',borderRadius:'var(--r)',cursor:'pointer',background:'transparent',fontFamily:'inherit'}}>Annulla</button>
            <button style={{padding:'6px 14px',fontSize:12,fontWeight:600,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>Salva</button>
          </div>
        </div>
      )}

      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed'}}>
          <colgroup><col style={{width:75}}/><col/><col style={{width:80}}/><col style={{width:80}}/><col style={{width:80}}/><col style={{width:50}}/></colgroup>
          <thead><tr style={{background:'var(--card2)'}}>
            {['ID','Cliente + Descrizione','Tecnica','Data','Stato','€'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 11px',color:'var(--ink3)',fontWeight:500,borderBottom:'1px solid var(--border)',fontSize:10}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(c=>{
              const s=SM[c.status]||SM.inviato
              return(<tr key={c.id}>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontSize:10,fontWeight:500}}>{c.id}</td>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.cli}</div>
                  <div style={{fontSize:10,color:'var(--ink3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.desc}</div>
                  {c.note && <div style={{fontSize:10,color:'var(--ink3)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>💬 {c.note}</div>}
                </td>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f1f0ec',color:'#5f5e5a'}}>{c.tech}</span></td>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontSize:10,color:'var(--ink3)'}}>{c.data}</td>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><span style={{display:'inline-flex',padding:'1px 6px',borderRadius:10,fontSize:9,fontWeight:700,background:s.bg,color:s.text}}>{s.label}</span></td>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontWeight:500,textAlign:'right'}}>€{c.costo}</td>
              </tr>)
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
