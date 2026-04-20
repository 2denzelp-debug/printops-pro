'use client'
const MACHINES = [
  { id:1,name:'Stampante DTF Pro X8',type:'DTF',status:'operativa',pos:'Lab A',sn:'DTF-0023',maint:'20 mag 2026',nero:72,ciano:45,magenta:38,giallo:61,mt:1240 },
  { id:2,name:'Ricamatrice Tajima 6T',type:'Ricamo',status:'guasta',pos:'Lab A',sn:'TAJ-0441',note:'Ago rotto — assistenza richiesta' },
  { id:3,name:'Pressa piana 60×80',type:'Pressa',status:'operativa',pos:'Lab B',sn:'PRS-0112',maint:'10 mag 2026' },
  { id:4,name:'Plotter vinile Roland',type:'Plotter',status:'manutenzione',pos:'Lab C',sn:'ROL-0088' },
  { id:5,name:'DTG Epson F3070',type:'DTG',status:'operativa',pos:'Lab A',sn:'EPS-0234',maint:'30 mag 2026',nero:55,ciano:80,magenta:60,giallo:75,mt:890 },
]
const SC: Record<string,string> = { operativa:'var(--green)',guasta:'var(--red)',manutenzione:'var(--amber)',dismessa:'var(--ink3)' }
const SB: Record<string,{bg:string,text:string}> = { operativa:{bg:'#dcfce7',text:'#15803d'},guasta:{bg:'#fee2e2',text:'#b91c1c'},manutenzione:{bg:'#fef3c7',text:'#b45309'},dismessa:{bg:'#f1f0ec',text:'#5f5e5a'} }

export default function MacchinePage() {
  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14 }}>
        {[['Totale',MACHINES.length],['Operative',MACHINES.filter(m=>m.status==='operativa').length],['Guaste',MACHINES.filter(m=>m.status==='guasta').length],['Manutenzione',MACHINES.filter(m=>m.status==='manutenzione').length]].map(([l,v]) => (
          <div key={l as string} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px' }}>
            <div style={{ fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4 }}>{l as string}</div>
            <div style={{ fontSize:22,fontWeight:600,fontFamily:'DM Mono,monospace' }}>{v as number}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10 }}>
        {MACHINES.map(m => {
          const sc = SB[m.status]
          return (
            <div key={m.id} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:14 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:SC[m.status],flexShrink:0 }}/>
                <div style={{ fontSize:12,fontWeight:600,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{m.name}</div>
              </div>
              <div style={{ display:'flex',gap:6,marginBottom:8,flexWrap:'wrap' }}>
                <span style={{ fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:10,background:sc.bg,color:sc.text }}>{m.status}</span>
                <span style={{ fontSize:9,padding:'1px 6px',borderRadius:10,background:'#f1f0ec',color:'#5f5e5a' }}>{m.type}</span>
                <span style={{ fontSize:9,padding:'1px 6px',borderRadius:10,background:'#f1f0ec',color:'#5f5e5a' }}>{m.pos}</span>
              </div>
              {m.note && <div style={{ fontSize:10,background:'#fee2e2',color:'#b91c1c',padding:'5px 8px',borderRadius:6,marginBottom:8 }}>⚠ {m.note}</div>}
              {m.sn && <div style={{ fontSize:10,color:'var(--ink3)',marginBottom:4 }}>SN: {m.sn}</div>}
              {m.maint && <div style={{ fontSize:10,color:'var(--ink3)',marginBottom:4 }}>Prossima manutenzione: {m.maint}</div>}
              {m.nero !== undefined && (
                <div style={{ marginTop:8 }}>
                  <div style={{ fontSize:10,fontWeight:600,color:'var(--ink3)',marginBottom:6 }}>Inchiostri</div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:4 }}>
                    {[['Nero',m.nero,'#1a1a18'],['Ciano',m.ciano,'#0284c7'],['Magenta',m.magenta,'#be185d'],['Giallo',m.giallo,'#b45309']].map(([n,v,c]) => (
                      <div key={n as string}>
                        <div style={{ display:'flex',justifyContent:'space-between',fontSize:9 }}><span style={{ color:c as string }}>{n as string}</span><span style={{ fontFamily:'DM Mono,monospace',color:(v as number)<40?'var(--red-text)':(v as number)<60?'var(--amber-text)':'var(--ink3)' }}>{v as number}%</span></div>
                        <div style={{ height:3,background:'#f1f0ec',borderRadius:2,marginTop:2 }}><div style={{ height:'100%',width:(v as number)+'%',background:(v as number)<40?'var(--red)':(v as number)<60?'var(--amber)':c as string,borderRadius:2 }}/></div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:9,color:'var(--ink3)',marginTop:6 }}>Stampati: {m.mt?.toLocaleString('it')}m</div>
                </div>
              )}
              <div style={{ marginTop:10,display:'flex',gap:6 }}>
                {m.status==='guasta' && <button style={{ flex:1,padding:'6px 8px',fontSize:10,fontWeight:600,background:'#fee2e2',color:'#b91c1c',border:'1px solid rgba(239,68,68,0.3)',borderRadius:6,cursor:'pointer',fontFamily:'inherit' }}>🔧 Richiedi assistenza</button>}
                {m.status!=='guasta' && <button style={{ flex:1,padding:'6px 8px',fontSize:10,background:'var(--card2)',border:'1px solid var(--border2)',borderRadius:6,cursor:'pointer',fontFamily:'inherit' }}>📋 Log manutenzione</button>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
