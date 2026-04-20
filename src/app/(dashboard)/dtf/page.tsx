'use client'
import { useState } from 'react'

const DTF_ORDERS = [
  { id:'DTF-019',cli:'Marco Rossi',desc:'Transfer logo fronte',largh:'30cm',mt:2.4,colori:'Full color',status:'stampa',data:'15 apr' },
  { id:'DTF-018',cli:'Sport Club',desc:'Numeri + nome giocatori',largh:'60cm',mt:8.2,colori:'Bianco+colori',status:'pronto',data:'13 apr' },
  { id:'DTF-017',cli:'Galli Rist.',desc:'Logo chef ricamato DTF',largh:'30cm',mt:1.1,colori:'2 colori',status:'completato',data:'11 apr' },
  { id:'DTF-016',cli:'Nuovo Lead',desc:'Test campione felpa',largh:'30cm',mt:0.5,colori:'Full color',status:'bozza',data:'14 apr' },
  { id:'DTF-015',cli:'FitZone',desc:'Logo canotte sport',largh:'60cm',mt:4.8,colori:'3 colori',status:'bozza',data:'16 apr' },
]
const FILM = [
  { nome:'Film 30cm',qty:42,min:20,unit:'m',pos:'Scaffale D · Rip.1' },
  { nome:'Film 60cm',qty:8,min:15,unit:'m',pos:'Scaffale D · Rip.2' },
  { nome:'Film A3',qty:200,min:50,unit:'fogli',pos:'Scaffale D · Rip.3' },
]
const SM: Record<string,{bg:string,text:string,label:string}> = {
  bozza:{bg:'#f1f0ec',text:'#5f5e5a',label:'Bozza'},
  stampa:{bg:'#fef3c7',text:'#b45309',label:'In stampa'},
  pronto:{bg:'#dcfce7',text:'#15803d',label:'Pronto'},
  completato:{bg:'#ccfbf1',text:'#0f766e',label:'Completato'},
}

export default function DTFPage() {
  const [filter, setFilter] = useState('tutti')
  const filtered = filter==='tutti' ? DTF_ORDERS : DTF_ORDERS.filter(d=>d.status===filter)
  const inp: React.CSSProperties = {width:'100%',border:'1px solid var(--border2)',borderRadius:'var(--r)',padding:'7px 10px',fontSize:12,background:'var(--card)',color:'var(--ink)',outline:'none',fontFamily:'inherit'}

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14}}>
        {[['Ordini attivi',DTF_ORDERS.filter(d=>d.status!=='completato').length,'var(--ink)'],
          ['Film 30cm',FILM[0].qty+'m',FILM[0].qty<FILM[0].min?'var(--red-text)':'var(--ink)'],
          ['Film 60cm',FILM[1].qty+'m','var(--red-text)'],
          ['Metri totali',DTF_ORDERS.filter(d=>d.status!=='bozza').reduce((a,d)=>a+d.mt,0).toFixed(1)+'m','var(--ink)'],
        ].map(([l,v,c])=>(
          <div key={l as string} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px'}}>
            <div style={{fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{l as string}</div>
            <div style={{fontSize:22,fontWeight:600,fontFamily:'DM Mono,monospace',color:c as string}}>{v as string}</div>
            {(l as string)==='Film 60cm' && <div style={{fontSize:10,color:'var(--red-text)',marginTop:2}}>⚠ Sotto scorta (min 15m)</div>}
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.6fr) minmax(0,1fr)',gap:12}}>
        <div>
          <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap',alignItems:'center'}}>
            {['tutti','bozza','stampa','pronto','completato'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:'4px 10px',fontSize:11,fontWeight:500,border:'1px solid var(--border2)',borderRadius:20,cursor:'pointer',fontFamily:'inherit',background:filter===f?'#0c0c0a':'var(--card)',color:filter===f?'#fff':'var(--ink2)',textTransform:'capitalize'}}>{f}</button>
            ))}
            <button style={{marginLeft:'auto',padding:'5px 12px',fontSize:11,fontWeight:600,background:'var(--green)',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>+ Nuovo DTF</button>
          </div>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed'}}>
              <colgroup><col style={{width:75}}/><col/><col style={{width:55}}/><col style={{width:55}}/><col style={{width:65}}/><col style={{width:70}}/></colgroup>
              <thead><tr style={{background:'var(--card2)'}}>
                {['ID','Descrizione','Film','Metri','Colori','Stato'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 11px',color:'var(--ink3)',fontWeight:500,borderBottom:'1px solid var(--border)',fontSize:10}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(d=>{
                  const s=SM[d.status]||SM.bozza
                  return(<tr key={d.id} style={{cursor:'pointer'}}>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontSize:10,fontWeight:500}}>{d.id}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><div style={{fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.cli}</div><div style={{fontSize:10,color:'var(--ink3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.desc}</div></td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:4,background:'#f1f0ec',color:'#5f5e5a'}}>{d.largh}</span></td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace'}}>{d.mt}m</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontSize:10,color:'var(--ink3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.colori}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><span style={{display:'inline-flex',padding:'1px 6px',borderRadius:10,fontSize:9,fontWeight:700,background:s.bg,color:s.text}}>{s.label}</span></td>
                  </tr>)
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
            <div style={{padding:'9px 13px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:600}}>Stock film</div>
            {FILM.map(s=>{
              const pct=Math.min(100,Math.round(s.qty/Math.max(s.min*2,1)*100))
              const col=s.qty<s.min?'var(--amber)':'var(--green)'
              return(<div key={s.nome} style={{padding:'10px 13px',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <div><div style={{fontSize:12,fontWeight:500}}>{s.nome}</div><div style={{fontSize:9,color:'var(--ink3)'}}>{s.pos}</div></div>
                  <div style={{fontFamily:'DM Mono,monospace',fontWeight:600,color:col}}>{s.qty}{s.unit}</div>
                </div>
                <div style={{height:4,background:'var(--surface)',borderRadius:2}}><div style={{height:'100%',width:pct+'%',background:col,borderRadius:2}}/></div>
              </div>)
            })}
          </div>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:14}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:10}}>Stime consumo</div>
            <div style={{padding:'8px 10px',background:'#fef3c7',borderRadius:8,marginBottom:8}}><div style={{fontSize:11,fontWeight:600,color:'#b45309'}}>⚠ Film 60cm — finisce in ~3 giorni</div><div style={{fontSize:10,color:'#92400e',marginTop:2}}>Ordine fornitore consigliato entro oggi</div></div>
            <div style={{padding:'8px 10px',background:'#f0fdf4',borderRadius:8,marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:'#15803d'}}>✓ Film 30cm — scorta per ~18 giorni</div></div>
            <button style={{width:'100%',padding:'8px',fontSize:12,fontWeight:600,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>📦 Ordina rifornimento</button>
          </div>
        </div>
      </div>
    </div>
  )
}
