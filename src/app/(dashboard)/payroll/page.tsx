'use client'
const EMP = [
  { name:'Giulia Mancini',dept:'Produzione',rate:16,hours:168,straord:0,ferie:2 },
  { name:'Marco Ferretti',dept:'Produzione',rate:18,hours:152,straord:0,ferie:2 },
  { name:'Sara Romano',dept:'Reparto Grafico',rate:20,hours:160,straord:0,ferie:3 },
  { name:'Andrea Conti',dept:'Magazzino',rate:14,hours:168,straord:1,ferie:2 },
  { name:'Elisa Galli',dept:'Vendite',rate:22,hours:140,straord:0,ferie:2 },
]
export default function PayrollPage(){
  const totalOrd = EMP.reduce((a,e)=>a+e.rate*e.hours,0)
  const totalExtra = EMP.reduce((a,e)=>a+(e.straord*e.rate*1.25),0)
  return(
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14}}>
        {[['Costo totale','€'+(totalOrd+totalExtra).toLocaleString('it'),'var(--ink)'],['Straordinari','1h','var(--amber-text)'],['Ferie medie','2.4gg','var(--ink3)'],['Malattie','0','var(--green-text)']].map(([l,v,c])=>(
          <div key={l as string} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px'}}>
            <div style={{fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{l as string}</div>
            <div style={{fontSize:20,fontWeight:600,fontFamily:'DM Mono,monospace',color:c as string}}>{v as string}</div>
          </div>
        ))}
      </div>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
        <div style={{padding:'9px 13px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:12,fontWeight:600}}>Riepilogo Aprile 2026</span>
          <button style={{padding:'4px 12px',fontSize:11,fontWeight:600,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>📄 Export per commercialista</button>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed'}}>
          <colgroup><col/><col style={{width:65}}/><col style={{width:65}}/><col style={{width:55}}/><col style={{width:55}}/><col style={{width:80}}/><col style={{width:90}}/></colgroup>
          <thead><tr style={{background:'var(--card2)'}}>
            {['Dipendente','Ore ord.','Straord.','Ferie','€/ora','Totale','Note'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 11px',color:'var(--ink3)',fontWeight:500,borderBottom:'1px solid var(--border)',fontSize:10}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {EMP.map(e=>{
              const tot = e.rate*e.hours + e.straord*e.rate*1.25
              return(
                <tr key={e.name}>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontWeight:500}}>{e.name}</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',textAlign:'center'}}>{e.hours}h</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',textAlign:'center',color:e.straord>0?'var(--amber-text)':'var(--ink3)'}}>{e.straord>0?e.straord+'h':'—'}</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',textAlign:'center',color:'var(--ink3)'}}>{e.ferie}gg</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace'}}>€{e.rate}/h</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',fontWeight:600}}>€{tot.toLocaleString('it')}</td>
                  <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontSize:10,color:'var(--ink3)'}}>{e.straord>0?'Straord. x1.25':'—'}</td>
                </tr>
              )
            })}
            <tr style={{background:'var(--card2)'}}>
              <td colSpan={5} style={{padding:'8px 11px',fontWeight:700}}>TOTALE APRILE</td>
              <td style={{padding:'8px 11px',fontFamily:'DM Mono,monospace',fontWeight:700,fontSize:13}}>€{(totalOrd+totalExtra).toLocaleString('it')}</td>
              <td/>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
