'use client'
import { useState } from 'react'

const STICKERS = [
  { id:'STK-008',cli:'FitZone srl',desc:'Sticker logo rotondo',dim:'5×5cm',qty:500,mat:'Vinile opaco',fin:'Plastificata lucida',status:'produzione',val:180 },
  { id:'STK-007',cli:'Rossi Events',desc:'Etichette bottiglie',dim:'9×6cm',qty:1000,mat:'Vinile lucido',fin:'Waterproof',status:'pronto',val:320 },
  { id:'STK-006',cli:'Tech Startup',desc:'Sticker packaging',dim:'3×3cm',qty:2000,mat:'Kraft',fin:'Nessuna',status:'completato',val:140 },
  { id:'STK-005',cli:'Sport Club',desc:'Patch termoadesive',dim:'7×4cm',qty:300,mat:'Vinile termoadesivo',fin:'Taglio sagomato',status:'bozza',val:220 },
]
const MAT_STOCK = [
  { nome:'Vinile bianco opaco',qty:25,min:10,unit:'m²',pos:'Scaffale E · Rip.1' },
  { nome:'Vinile trasparente',qty:6,min:10,unit:'m²',pos:'Scaffale E · Rip.2' },
  { nome:'Vinile lucido',qty:18,min:8,unit:'m²',pos:'Scaffale E · Rip.3' },
  { nome:'Carta kraft',qty:40,min:15,unit:'fogli',pos:'Scaffale E · Rip.4' },
]
const LAVORAZIONI = ['Taglio sagomato','Plastificazione lucida','Plastificazione opaca','Waterproof','Antigraffio','Laminazione','Fustellatura']
const SM: Record<string,{bg:string,text:string,label:string}> = {
  bozza:{bg:'#f1f0ec',text:'#5f5e5a',label:'Bozza'},
  produzione:{bg:'#fef3c7',text:'#b45309',label:'In produzione'},
  pronto:{bg:'#dcfce7',text:'#15803d',label:'Pronto'},
  completato:{bg:'#ccfbf1',text:'#0f766e',label:'Completato'},
}

export default function AdesiviPage() {
  const pipeline = STICKERS.filter(s=>s.status!=='completato').reduce((a,s)=>a+s.val,0)
  const inp: React.CSSProperties = {border:'1px solid var(--border2)',borderRadius:'var(--r)',padding:'6px 10px',fontSize:12,background:'var(--card)',color:'var(--ink)',outline:'none',fontFamily:'inherit'}

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14}}>
        {[['Ordini attivi',STICKERS.filter(s=>s.status!=='completato').length,'var(--ink)'],
          ['Vinile bianco',MAT_STOCK[0].qty+'m²',MAT_STOCK[0].qty<MAT_STOCK[0].min?'var(--red-text)':'var(--ink)'],
          ['Vinile trasp.',MAT_STOCK[1].qty+'m²','var(--red-text)'],
          ['Pipeline','€'+pipeline,'var(--ink)'],
        ].map(([l,v,c])=>(
          <div key={l as string} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px'}}>
            <div style={{fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{l as string}</div>
            <div style={{fontSize:22,fontWeight:600,fontFamily:'DM Mono,monospace',color:c as string}}>{v as string}</div>
            {(l as string)==='Vinile trasp.' && <div style={{fontSize:10,color:'var(--red-text)',marginTop:2}}>⚠ Sotto scorta minima</div>}
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.6fr) minmax(0,1fr)',gap:12}}>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--ink2)'}}>Ordini sticker & adesivi</div>
            <button style={{padding:'5px 12px',fontSize:11,fontWeight:600,background:'var(--green)',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>+ Nuovo ordine</button>
          </div>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed'}}>
              <colgroup><col style={{width:70}}/><col/><col style={{width:55}}/><col style={{width:55}}/><col/><col style={{width:70}}/><col style={{width:50}}/></colgroup>
              <thead><tr style={{background:'var(--card2)'}}>
                {['ID','Descrizione','Dim','Qtà','Materiale','Stato','€'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 11px',color:'var(--ink3)',fontWeight:500,borderBottom:'1px solid var(--border)',fontSize:10}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {STICKERS.map(s=>{
                  const sm=SM[s.status]||SM.bozza
                  return(<tr key={s.id} style={{cursor:'pointer'}}>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontSize:10,fontWeight:500}}>{s.id}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><div style={{fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.cli}</div><div style={{fontSize:10,color:'var(--ink3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.desc}</div></td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontSize:10}}>{s.dim}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace'}}>{s.qty}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontSize:10,color:'var(--ink3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.mat}</td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><span style={{display:'inline-flex',padding:'1px 6px',borderRadius:10,fontSize:9,fontWeight:700,background:sm.bg,color:sm.text}}>{sm.label}</span></td>
                    <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontWeight:500,textAlign:'right'}}>€{s.val}</td>
                  </tr>)
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
            <div style={{padding:'9px 13px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:600}}>Materiali</div>
            {MAT_STOCK.map(s=>{
              const pct=Math.min(100,Math.round(s.qty/Math.max(s.min*2,1)*100))
              const col=s.qty<s.min?'var(--amber)':'var(--green)'
              return(<div key={s.nome} style={{padding:'10px 13px',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <div><div style={{fontSize:11,fontWeight:500}}>{s.nome}</div><div style={{fontSize:9,color:'var(--ink3)'}}>{s.pos}</div></div>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:11,fontWeight:600,color:col}}>{s.qty}{s.unit}</div>
                </div>
                <div style={{height:4,background:'var(--surface)',borderRadius:2}}><div style={{height:'100%',width:pct+'%',background:col,borderRadius:2}}/></div>
              </div>)
            })}
          </div>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:14}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:10}}>Lavorazioni disponibili</div>
            {LAVORAZIONI.map(l=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',flexShrink:0}}/>
                <div style={{fontSize:12}}>{l}</div>
                <span style={{marginLeft:'auto',fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#dcfce7',color:'#15803d'}}>Attivo</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
