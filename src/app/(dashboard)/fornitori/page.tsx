'use client'
import { useState } from 'react'

const FORN = [
  { id:'FOR-001',nome:'Tessuti Italia srl',contact:'Luca Ferrari',email:'luca@tessuti.it',tel:'+39 02 1234 5678',city:'Milano',lead:3,score:5,cat:'Tessuti',isActive:true },
  { id:'FOR-002',nome:'Film DTF Express',contact:'Maria Rossi',email:'m.rossi@dtfexpress.it',tel:'+39 347 000 1111',city:'Bologna',lead:5,score:4,cat:'DTF/Film',isActive:true },
  { id:'FOR-003',nome:'Inchiostri Pro',contact:'Carlo Bianchi',email:'carlo@inchiostri.it',tel:'+39 333 222 3333',city:'Torino',lead:7,score:4,cat:'Inchiostri',isActive:true },
  { id:'FOR-004',nome:'Packaging Italia',contact:'Anna Verdi',email:'anna@packaging.it',tel:'+39 351 444 5555',city:'Roma',lead:10,score:3,cat:'Packaging',isActive:true },
  { id:'FOR-005',nome:'FiloLux',contact:'Marco Neri',email:'m.neri@filolux.it',tel:'+39 344 666 7777',city:'Firenze',lead:4,score:5,cat:'Fili ricamo',isActive:true },
]

function Stars({ n }: { n: number }) {
  return <span>{Array.from({length:5}).map((_,i)=><span key={i} style={{color:i<n?'#f59e0b':'var(--border2)',fontSize:12}}>★</span>)}</span>
}

export default function FornitoriPage() {
  const [selected, setSelected] = useState<typeof FORN[0]|null>(null)
  const [showForm, setShowForm] = useState(false)
  const inp: React.CSSProperties = {width:'100%',border:'1px solid var(--border2)',borderRadius:'var(--r)',padding:'7px 10px',fontSize:12,background:'var(--card)',color:'var(--ink)',outline:'none',fontFamily:'inherit'}

  return (
    <div style={{display:'flex',gap:12,height:'calc(100vh - 76px)'}}>
      <div style={{flex:selected?'0 0 60%':'1',display:'flex',flexDirection:'column',minWidth:0}}>
        <div style={{display:'flex',gap:8,marginBottom:10,alignItems:'center',justifyContent:'space-between'}}>
          <input placeholder="Cerca fornitore..." style={{...inp,flex:1,maxWidth:300}}/>
          <button onClick={()=>setShowForm(!showForm)} style={{padding:'5px 12px',fontSize:11,fontWeight:600,background:'var(--green)',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>+ Nuovo fornitore</button>
        </div>
        {showForm && (
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:14,marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Nuovo fornitore</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              {[['Ragione sociale','es. Tessuti Italia srl'],['Referente','es. Luca Ferrari'],['Email','email@fornitore.it'],['Telefono','+39 333 000 0000'],['Città','Milano'],['Categoria','es. Tessuti, DTF, Inchiostri']].map(([l,ph])=>(
                <div key={l}><div style={{fontSize:10,color:'var(--ink3)',marginBottom:3}}>{l}</div><input style={inp} placeholder={ph}/></div>
              ))}
            </div>
            <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
              <button onClick={()=>setShowForm(false)} style={{padding:'6px 14px',fontSize:12,border:'1px solid var(--border2)',borderRadius:'var(--r)',cursor:'pointer',background:'transparent',fontFamily:'inherit'}}>Annulla</button>
              <button style={{padding:'6px 14px',fontSize:12,fontWeight:600,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>Salva</button>
            </div>
          </div>
        )}
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden',flex:1,overflowY:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed'}}>
            <colgroup><col/><col style={{width:130}}/><col style={{width:80}}/><col style={{width:60}}/><col style={{width:80}}/></colgroup>
            <thead><tr style={{background:'var(--card2)'}}>
              {['Fornitore','Contatto','Categoria','Lead','Valut.'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 11px',color:'var(--ink3)',fontWeight:500,borderBottom:'1px solid var(--border)',fontSize:10}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {FORN.map(f=>(
                <tr key={f.id} onClick={()=>setSelected(selected?.id===f.id?null:f)} style={{cursor:'pointer',background:selected?.id===f.id?'#f0fdf4':'transparent'}}>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}>
                    <div style={{fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.nome}</div>
                    <div style={{fontSize:10,color:'var(--ink3)'}}>{f.city}</div>
                  </td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontSize:10,color:'var(--ink3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.contact}</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#dbeafe',color:'#1d4ed8'}}>{f.cat}</span></td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace'}}>{f.lead}gg</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><Stars n={f.score}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selected && (
        <div style={{flex:'0 0 37%',background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div><div style={{fontSize:14,fontWeight:600}}>{selected.nome}</div><div style={{fontSize:11,color:'var(--ink3)'}}>{selected.cat} · {selected.city}</div></div>
            <button onClick={()=>setSelected(null)} style={{padding:'3px 8px',fontSize:10,border:'1px solid var(--border2)',borderRadius:6,cursor:'pointer',background:'transparent',fontFamily:'inherit'}}>✕</button>
          </div>
          <div style={{padding:14,flex:1,overflowY:'auto'}}>
            {[['👤','Referente',selected.contact],['📧','Email',selected.email],['📱','Telefono',selected.tel],['📍','Città',selected.city],['⏱','Lead time',selected.lead+' giorni'],['🏷','Categoria',selected.cat]].map(([icon,label,val])=>(
              <div key={label as string} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{fontSize:14}}>{icon as string}</span>
                <div><div style={{fontSize:10,color:'var(--ink3)'}}>{label as string}</div><div style={{fontSize:12,fontWeight:500}}>{val as string}</div></div>
              </div>
            ))}
            <div style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:10,color:'var(--ink3)',marginBottom:4}}>Valutazione affidabilità</div>
              <Stars n={selected.score}/>
            </div>
            <div style={{marginTop:14,display:'flex',gap:6}}>
              <button style={{flex:1,padding:'8px',fontSize:11,fontWeight:500,background:'var(--card2)',border:'1px solid var(--border2)',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>📦 Ordine fornitore</button>
              <button style={{flex:1,padding:'8px',fontSize:11,fontWeight:500,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>✏️ Modifica</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
