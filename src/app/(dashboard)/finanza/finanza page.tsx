'use client'
import { useState } from 'react'

const ALLOC = [
  { cat:'Stipendi',val:5200,col:'#3b82f6',pct:42 },
  { cat:'Fornitori',val:3800,col:'#22c55e',pct:31 },
  { cat:'Tasse',val:1500,col:'#ef4444',pct:12 },
  { cat:'Finanziamento',val:880,col:'#f59e0b',pct:7 },
  { cat:'Margine',val:1000,col:'#8b5cf6',pct:8 },
]
const VOCI = [
  { desc:'ORD-031 — Marco Rossi',tipo:'entrata',val:480,data:'15 apr',cat:'ordini' },
  { desc:'ORD-030 — Anna Conti',tipo:'entrata',val:1200,data:'14 apr',cat:'ordini' },
  { desc:'Stipendi aprile',tipo:'uscita',val:5200,data:'10 apr',cat:'stipendi' },
  { desc:'Fornitore Tessuti Italia',tipo:'uscita',val:1840,data:'09 apr',cat:'fornitori' },
  { desc:'Leasing macchinari',tipo:'uscita',val:880,data:'05 apr',cat:'finanziamento' },
  { desc:'ORD-029 — Sara Bianchi',tipo:'entrata',val:390,data:'04 apr',cat:'ordini' },
  { desc:'Utenze laboratorio',tipo:'uscita',val:420,data:'02 apr',cat:'utenze' },
  { desc:'ORD-028 — Dario Ricci',tipo:'entrata',val:650,data:'01 apr',cat:'ordini' },
]

export default function FinanzaPage() {
  const [tab, setTab] = useState<'overview'|'movimenti'>('overview')
  const entrate = VOCI.filter(v=>v.tipo==='entrata').reduce((a,v)=>a+v.val,0)
  const uscite  = VOCI.filter(v=>v.tipo==='uscita').reduce((a,v)=>a+v.val,0)
  const margine = entrate - uscite

  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14 }}>
        {[
          ['Entrate aprile','€'+entrate.toLocaleString('it'),'var(--green-text)'],
          ['Uscite aprile','€'+uscite.toLocaleString('it'),'var(--red-text)'],
          ['Margine','€'+margine.toLocaleString('it'),'#8b5cf6'],
          ['% Margine',Math.round(margine/entrate*100)+'%',margine>0?'var(--green-text)':'var(--red-text)']
        ].map(([l,v,c]) => (
          <div key={l as string} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'10px 12px' }}>
            <div style={{ fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4 }}>{l as string}</div>
            <div style={{ fontSize:22,fontWeight:600,fontFamily:'DM Mono,monospace',color:c as string }}>{v as string}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex',gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:16,marginBottom:12 }}>
            <div style={{ fontSize:12,fontWeight:600,marginBottom:12 }}>Allocazione uscite — Aprile</div>
            <div style={{ display:'flex',height:28,borderRadius:8,overflow:'hidden',marginBottom:14 }}>
              {ALLOC.map(a => <div key={a.cat} style={{ width:a.pct+'%',background:a.col }} title={a.cat+': '+a.pct+'%'}/>)}
            </div>
            {ALLOC.map(a => (
              <div key={a.cat} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                <div style={{ width:10,height:10,borderRadius:'50%',background:a.col,flexShrink:0 }}/>
                <div style={{ flex:1,fontSize:12 }}>{a.cat}</div>
                <div style={{ fontFamily:'DM Mono,monospace',fontSize:12,fontWeight:500 }}>€{a.val.toLocaleString('it')}</div>
                <div style={{ fontSize:10,color:'var(--ink3)',minWidth:28,textAlign:'right' }}>{a.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }}>
          <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden' }}>
            <div style={{ padding:'9px 13px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <span style={{ fontSize:12,fontWeight:600 }}>Movimenti</span>
              <button style={{ padding:'3px 8px',fontSize:10,border:'1px solid var(--border2)',borderRadius:6,cursor:'pointer',background:'#0c0c0a',color:'#fff',fontFamily:'inherit' }}>+ Nuovo</button>
            </div>
            {VOCI.map((v,i) => (
              <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 13px',borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:7,height:7,borderRadius:'50%',background:v.tipo==='entrata'?'var(--green)':'var(--red)',flexShrink:0 }}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:11,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{v.desc}</div>
                  <div style={{ fontSize:9,color:'var(--ink3)' }}>{v.data} · {v.cat}</div>
                </div>
                <div style={{ fontFamily:'DM Mono,monospace',fontSize:12,fontWeight:600,color:v.tipo==='entrata'?'var(--green-text)':'var(--red-text)',whiteSpace:'nowrap' }}>
                  {v.tipo==='entrata'?'+':'−'}€{v.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
