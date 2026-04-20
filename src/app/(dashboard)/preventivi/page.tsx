'use client'
import { useState } from 'react'
const QUOTES = [
  { id:'PRE-022',cli:'Sport Club Milano',prod:'80x Jersey ricamo',val:960,stato:'inviato',urg:true,scad:'18 apr' },
  { id:'PRE-021',cli:'Luigi Ferrari',prod:'80x Polo promo',val:720,stato:'in_attesa',urg:true,scad:'20 apr' },
  { id:'PRE-020',cli:'Nuovo Lead WC',prod:'50x Felpa hoodie',val:650,stato:'bozza',urg:false,scad:'25 apr' },
  { id:'PRE-019',cli:'Palestra FitZone',prod:'120x Canotta sport',val:1440,stato:'bozza',urg:false,scad:'01 mag' },
  { id:'PRE-018',cli:'Ristorante Da Mario',prod:'40x Polo chef',val:580,stato:'inviato',urg:false,scad:'30 apr' },
  { id:'PRE-017',cli:'Accademia Musicale',prod:'200x T-shirt evento',val:1800,stato:'accettato',urg:false,scad:'10 mag' },
]
const SM: Record<string,{bg:string,text:string,label:string}> = {
  bozza:{bg:'#f1f0ec',text:'#5f5e5a',label:'Bozza'},
  inviato:{bg:'#dbeafe',text:'#1d4ed8',label:'Inviato'},
  in_attesa:{bg:'#fef3c7',text:'#b45309',label:'In attesa'},
  accettato:{bg:'#dcfce7',text:'#15803d',label:'Accettato'},
  rifiutato:{bg:'#fee2e2',text:'#b91c1c',label:'Rifiutato'},
}
export default function PreventiviPage(){
  const [filter,setFilter]=useState('tutti')
  const filtered = filter==='tutti' ? QUOTES : QUOTES.filter(q=>q.stato===filter)
  const pipeline = QUOTES.filter(q=>q.stato!=='rifiutato').reduce((a,q)=>a+q.val,0)
  return(
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14}}>
        {[['Pipeline','€'+pipeline.toLocaleString('it'),'var(--ink)'],['Urgenti',QUOTES.filter(q=>q.urg).length,'var(--amber-text)'],['In attesa',QUOTES.filter(q=>q.stato==='in_attesa').length,'var(--ink3)'],['Accettati',QUOTES.filter(q=>q.stato==='accettato').length,'var(--green-text)']].map(([l,v,c])=>(
          <div key={l as string} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px'}}>
            <div style={{fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{l as string}</div>
            <div style={{fontSize:22,fontWeight:600,fontFamily:'DM Mono,monospace',color:c as string}}>{v as string|number}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,marginBottom:10,alignItems:'center'}}>
        {['tutti','bozza','inviato','in_attesa','accettato'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 11px',fontSize:11,fontWeight:500,border:'1px solid var(--border2)',borderRadius:20,cursor:'pointer',fontFamily:'inherit',background:filter===f?'#0c0c0a':'var(--card)',color:filter===f?'#fff':'var(--ink2)',textTransform:'capitalize'}}>{f.replace('_',' ')}</button>
        ))}
        <button style={{marginLeft:'auto',padding:'5px 12px',fontSize:11,fontWeight:600,background:'var(--green)',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>+ Nuovo preventivo</button>
      </div>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed'}}>
          <colgroup><col style={{width:80}}/><col/><col/><col style={{width:80}}/><col style={{width:80}}/><col style={{width:55}}/></colgroup>
          <thead><tr style={{background:'var(--card2)'}}>{['Codice','Cliente','Articoli','Scadenza','Stato','€'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 11px',color:'var(--ink3)',fontWeight:500,borderBottom:'1px solid var(--border)',fontSize:10}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(q=>{
              const s=SM[q.stato]||SM.bozza
              return(
                <tr key={q.id} style={{cursor:'pointer'}}>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontSize:10,fontWeight:500}}>{q.urg&&<span style={{width:5,height:5,borderRadius:'50%',background:'var(--amber)',display:'inline-block',marginRight:3,verticalAlign:'middle'}}/>}{q.id}</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q.cli}</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',color:'var(--ink2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q.prod}</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontSize:10,color:'var(--ink3)'}}>{q.scad}</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><span style={{display:'inline-flex',padding:'1px 6px',borderRadius:10,fontSize:9,fontWeight:700,background:s.bg,color:s.text}}>{s.label}</span></td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontWeight:500,textAlign:'right'}}>€{q.val}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
