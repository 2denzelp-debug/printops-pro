'use client'
import { useState } from 'react'

const LANES = [
  { id: 'da_iniziare', label: 'Da iniziare', color: '#f1f0ec' },
  { id: 'taglio',      label: 'Taglio',       color: '#dbeafe' },
  { id: 'stampa',      label: 'Stampa/Ricamo', color: '#fef3c7' },
  { id: 'confezione',  label: 'Confezionamento',color: '#ede9fe' },
  { id: 'completato',  label: 'Completato',    color: '#dcfce7' },
]

const DEMO_JOBS = [
  { id:'JOB-018',ord:'ORD-030',cli:'Anna Conti',tech:'Ricamo',qty:'200x',lane:'da_iniziare',urg:true },
  { id:'JOB-017',ord:'ORD-027',cli:'FitZone',tech:'Serigrafia',qty:'120x',lane:'da_iniziare',urg:false },
  { id:'JOB-016',ord:'ORD-031',cli:'Marco Rossi',tech:'Serigrafia',qty:'50x',lane:'taglio',urg:true },
  { id:'JOB-015',ord:'ORD-029',cli:'Sara Bianchi',tech:'DTG',qty:'30x',lane:'stampa',urg:false },
  { id:'JOB-014',ord:'ORD-026',cli:'Galli Rist.',tech:'Ricamo',qty:'60x',lane:'stampa',urg:false },
  { id:'JOB-013',ord:'ORD-025',cli:'Sport Club',tech:'Serigrafia',qty:'80x',lane:'confezione',urg:false },
  { id:'JOB-012',ord:'ORD-024',cli:'FitZone',tech:'DTG',qty:'40x',lane:'completato',urg:false },
]

export default function ProduzionePage() {
  const [jobs, setJobs] = useState(DEMO_JOBS)
  const [drag, setDrag] = useState<string|null>(null)

  function moveJob(id: string, toLane: string) {
    setJobs(prev => prev.map(j => j.id===id ? {...j, lane:toLane} : j))
  }

  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14 }}>
        {[['Job attivi','6','var(--ink)'],['Urgenti','2','var(--red-text)'],['In stampa','2','var(--amber-text)'],['Completati oggi','1','var(--green-text)']].map(([l,v,c]) => (
          <div key={l} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px' }}>
            <div style={{ fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:22,fontWeight:600,fontFamily:'DM Mono,monospace',color:c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex',gap:10,overflowX:'auto',paddingBottom:8 }}>
        {LANES.map(lane => {
          const laneJobs = jobs.filter(j => j.lane===lane.id)
          return (
            <div key={lane.id} style={{ minWidth:175,flex:1 }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if(drag) moveJob(drag, lane.id); setDrag(null) }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
                <div style={{ fontSize:10,fontWeight:600,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.06em' }}>{lane.label}</div>
                <span style={{ fontSize:9,background:'var(--card)',color:'var(--ink3)',padding:'1px 6px',borderRadius:8,border:'1px solid var(--border)' }}>{laneJobs.length}</span>
              </div>
              {laneJobs.map(job => (
                <div key={job.id} draggable onDragStart={() => setDrag(job.id)}
                  style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:10,marginBottom:8,cursor:'grab',transition:'border 0.1s' }}>
                  <div style={{ fontSize:9,fontFamily:'DM Mono,monospace',color:'var(--ink3)',display:'flex',alignItems:'center',gap:4 }}>
                    {job.urg && <span style={{ width:5,height:5,borderRadius:'50%',background:'var(--red)',display:'inline-block' }}/>}
                    {job.id}
                  </div>
                  <div style={{ fontSize:12,fontWeight:500,margin:'3px 0' }}>{job.cli}</div>
                  <div style={{ fontSize:10,color:'var(--ink3)' }}>{job.qty} · {job.tech}</div>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8 }}>
                    <span style={{ fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f1f0ec',color:'#5f5e5a' }}>{job.tech}</span>
                    <span style={{ fontSize:9,fontFamily:'DM Mono,monospace',color:'var(--ink3)' }}>{job.ord}</span>
                  </div>
                </div>
              ))}
              {laneJobs.length===0 && <div style={{ border:'1.5px dashed var(--border)',borderRadius:'var(--r)',height:60,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'var(--ink3)' }}>Vuoto</div>}
            </div>
          )
        })}
      </div>
      <div style={{ fontSize:11,color:'var(--ink3)',marginTop:8 }}>💡 Trascina le card tra le colonne per aggiornare la fase di produzione</div>
    </div>
  )
}
