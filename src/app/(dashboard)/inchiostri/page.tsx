'use client'
const MACHINES_INK = [
  { id:1,nome:'Stampante DTF Pro X8',tipo:'DTF',pos:'Lab A',nero:72,ciano:45,magenta:38,giallo:61,bianco:80,mt:1240,giorni:8 },
  { id:2,nome:'DTG Epson F3070',tipo:'DTG',pos:'Lab A',nero:55,ciano:80,magenta:60,giallo:75,mt:890,giorni:12 },
]
const INKS = [
  { nome:'Inchiostro nero (1L)',mac:'DTF Pro X8',livello:72,bottiglie:3,pos:'Scaffale F · Rip.1',soglia:30 },
  { nome:'Inchiostro cyan (1L)',mac:'DTF Pro X8',livello:45,bottiglie:2,pos:'Scaffale F · Rip.1',soglia:30 },
  { nome:'Inchiostro magenta (1L)',mac:'DTF Pro X8',livello:38,bottiglie:2,pos:'Scaffale F · Rip.2',soglia:30 },
  { nome:'Inchiostro giallo (1L)',mac:'DTF Pro X8',livello:61,bottiglie:2,pos:'Scaffale F · Rip.2',soglia:30 },
  { nome:'Inchiostro bianco (1L)',mac:'DTF Pro X8',livello:80,bottiglie:4,pos:'Scaffale F · Rip.3',soglia:40 },
  { nome:'Inchiostro nero DTG (1L)',mac:'Epson F3070',livello:55,bottiglie:2,pos:'Scaffale F · Rip.4',soglia:30 },
]

export default function InchiostriPage() {
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14}}>
        {[['Macchine monitorate',MACHINES_INK.length,'var(--ink)'],
          ['Cartucce sotto soglia',INKS.filter(i=>i.livello<i.soglia).length,'var(--red-text)'],
          ['Consumo medio','~8ml/m²','var(--ink3)'],
          ['Mt. stampati totali',(MACHINES_INK.reduce((a,m)=>a+m.mt,0)).toLocaleString('it')+'m','var(--ink)'],
        ].map(([l,v,c])=>(
          <div key={l as string} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px'}}>
            <div style={{fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{l as string}</div>
            <div style={{fontSize:20,fontWeight:600,fontFamily:'DM Mono,monospace',color:c as string}}>{v as string}</div>
          </div>
        ))}
      </div>

      {MACHINES_INK.map(m=>(
        <div key={m.id} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden',marginBottom:12}}>
          <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div><div style={{fontSize:13,fontWeight:600}}>{m.nome}</div><div style={{fontSize:11,color:'var(--ink3)'}}>{m.tipo} · {m.pos} · {m.mt.toLocaleString('it')}m stampati</div></div>
            <div style={{fontSize:11,color:'var(--ink3)'}}>Stima rifornimento tra <strong style={{color:'var(--ink)'}}>{m.giorni} giorni</strong></div>
          </div>
          <div style={{padding:'14px',display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:10}}>
            {([['Nero',m.nero,'#1a1a18','#f1f0ec'],['Ciano',m.ciano,'#0284c7','#e0f2fe'],['Magenta',m.magenta,'#be185d','#fce7f3'],['Giallo',m.giallo,'#b45309','#fef3c7'],m.bianco!==undefined&&['Bianco',m.bianco,'#6b7280','#f9fafb']].filter(Boolean) as string[][]).map(([n,v,c,bg])=>{
              const val = Number(v)
              const colorFill = val<30?'var(--red)':val<50?'var(--amber)':c
              return(
                <div key={n} style={{background:bg,borderRadius:'var(--r)',padding:'10px',textAlign:'center'}}>
                  <div style={{fontSize:10,fontWeight:600,color:c,marginBottom:4}}>{n}</div>
                  <div style={{fontSize:22,fontWeight:600,fontFamily:'DM Mono,monospace',color:val<30?'var(--red-text)':val<50?'var(--amber-text)':c}}>{val}%</div>
                  <div style={{height:4,background:'rgba(0,0,0,0.08)',borderRadius:2,margin:'6px 0 4px'}}><div style={{height:'100%',width:val+'%',background:colorFill,borderRadius:2}}/></div>
                  <div style={{fontSize:9,color:'var(--ink3)'}}>~{Math.round(val*0.5)}ml rim.</div>
                </div>
              )
            })}
          </div>
          <div style={{padding:'10px 14px',borderTop:'1px solid var(--border)',background:'var(--card2)',fontSize:11,color:'var(--ink2)'}}>
            <strong>Stima:</strong> Magenta e Ciano — ordine consigliato entro 5 giorni · Consumo medio {m.tipo==='DTF'?'8':'6'}ml/m²
          </div>
        </div>
      ))}

      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
        <div style={{padding:'9px 13px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:600}}>Scorte inchiostri in magazzino</div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed'}}>
          <colgroup><col/><col style={{width:120}}/><col style={{width:80}}/><col style={{width:80}}/><col style={{width:100}}/></colgroup>
          <thead><tr style={{background:'var(--card2)'}}>
            {['Inchiostro','Macchina','Livello','Bottiglie','Posizione'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 11px',color:'var(--ink3)',fontWeight:500,borderBottom:'1px solid var(--border)',fontSize:10}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {INKS.map(i=>{
              const col=i.livello<i.soglia?'var(--red-text)':i.livello<60?'var(--amber-text)':'var(--green-text)'
              return(<tr key={i.nome}>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.nome}</td>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontSize:10,color:'var(--ink3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.mac}</td>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)'}}><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{height:4,width:40,background:'var(--surface)',borderRadius:2}}><div style={{height:'100%',width:i.livello+'%',background:col.replace('-text','').replace('var(--red)','#ef4444').replace('var(--amber)','#f59e0b').replace('var(--green)','#22c55e'),borderRadius:2}}/></div><span style={{fontFamily:'DM Mono,monospace',fontSize:11,color:col}}>{i.livello}%</span></div></td>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace'}}>{i.bottiglie}</td>
                <td style={{padding:'8px 11px',borderBottom:'1px solid var(--border)',fontSize:10,color:'var(--ink3)'}}>{i.pos}</td>
              </tr>)
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
