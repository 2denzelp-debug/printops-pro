'use client'
const EMP = [
  { name:'Giulia Mancini',dept:'Produzione',status:'presente',in:'08:02',lun:8,mar:8,mer:8,gio:8,ven:8 },
  { name:'Marco Ferretti',dept:'Produzione',status:'presente',in:'08:15',lun:8,mar:8,mer:8,gio:7.5,ven:8 },
  { name:'Sara Romano',dept:'Reparto Grafico',status:'assente',in:'—',lun:0,mar:8,mer:8,gio:8,ven:8 },
  { name:'Andrea Conti',dept:'Magazzino',status:'presente',in:'07:55',lun:8,mar:8,mer:8,gio:8,ven:9 },
  { name:'Elisa Galli',dept:'Vendite',status:'presente',in:'09:00',lun:8,mar:8,mer:7,gio:8,ven:8 },
]
function ini(n:string){return n.split(' ').map(w=>w[0]).join('')}
export default function TimbraturaPage(){
  const tot = EMP.reduce((a,e)=>a+(e.lun+e.mar+e.mer+e.gio+e.ven),0)
  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14 }}>
        {[['Presenti ora',EMP.filter(e=>e.status==='presente').length,'var(--green-text)'],['Ore settimana',tot+'h','var(--ink)'],['Straordinari','1h','var(--amber-text)'],['Assenti oggi',EMP.filter(e=>e.status==='assente').length,'var(--red-text)']].map(([l,v,c])=>(
          <div key={l as string} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px'}}>
            <div style={{fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{l as string}</div>
            <div style={{fontSize:22,fontWeight:600,fontFamily:'DM Mono,monospace',color:c as string}}>{v as string}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:12}}>
        <div style={{flex:1}}>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden',marginBottom:12}}>
            <div style={{padding:'9px 13px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:600}}>Timbrature oggi — {new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'})}</div>
            {EMP.map(e=>(
              <div key={e.name} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 13px',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:7,height:7,borderRadius:'50%',background:e.status==='presente'?'var(--green)':'var(--red)',flexShrink:0}}/>
                <div style={{width:26,height:26,borderRadius:'50%',background:e.status==='presente'?'#dcfce7':'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:600,color:e.status==='presente'?'#15803d':'#b91c1c',flexShrink:0}}>{ini(e.name)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500}}>{e.name}</div>
                  <div style={{fontSize:10,color:'var(--ink3)'}}>{e.dept}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  {e.status==='presente'?(<><div style={{fontSize:11,fontWeight:500,color:'var(--green-text)'}}>In servizio</div><div style={{fontSize:9,color:'var(--ink3)',fontFamily:'DM Mono,monospace'}}>Entrata {e.in}</div></>):(<div style={{fontSize:11,color:'var(--red-text)'}}>Assente</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:1}}>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
            <div style={{padding:'9px 13px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:600}}>Ore settimana</div>
            <div style={{overflowX:'auto',padding:'10px 13px'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                <thead><tr>
                  <th style={{textAlign:'left',padding:'4px 6px',fontSize:10,color:'var(--ink3)',fontWeight:500}}>Dipendente</th>
                  {['Lun','Mar','Mer','Gio','Ven','Tot'].map(d=><th key={d} style={{textAlign:'center',padding:'4px 6px',fontSize:10,color:'var(--ink3)',fontWeight:500}}>{d}</th>)}
                </tr></thead>
                <tbody>
                  {EMP.map(e=>{
                    const tot=e.lun+e.mar+e.mer+e.gio+e.ven
                    return(
                      <tr key={e.name}>
                        <td style={{padding:'5px 6px',fontWeight:500,whiteSpace:'nowrap'}}>{e.name.split(' ')[0]}</td>
                        {[e.lun,e.mar,e.mer,e.gio,e.ven].map((h,i)=><td key={i} style={{textAlign:'center',padding:'5px 6px',fontFamily:'DM Mono,monospace',color:h===0?'var(--red-text)':'var(--ink)',fontSize:11}}>{h===0?'—':h}</td>)}
                        <td style={{textAlign:'center',padding:'5px 6px',fontWeight:600,fontFamily:'DM Mono,monospace'}}>{tot}h</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
