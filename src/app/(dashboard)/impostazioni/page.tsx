'use client'
import { useState, useEffect } from 'react'

type OrgData = { name: string; email: string; phone: string; city: string; vatNumber: string; plan: string; planStatus: string; maxUsers: number; currentUsers: number }
type UserData = { name: string; email: string; role: string; department: string }

export default function ImpostazioniPage() {
  const [tab, setTab] = useState('azienda')
  const [org, setOrg] = useState<OrgData|null>(null)
  const [user, setUser] = useState<UserData|null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      if(d.org) setOrg(d.org)
      if(d.user) setUser(d.user)
    })
  },[])

  function toast(){ setSaved(true); setTimeout(()=>setSaved(false),2500) }

  const inp: React.CSSProperties = {width:'100%',border:'1px solid var(--border2)',borderRadius:'var(--r)',padding:'8px 10px',fontSize:13,background:'var(--card)',color:'var(--ink)',outline:'none',fontFamily:'inherit'}
  const TABS = [['azienda','🏢 Azienda'],['profilo','👤 Profilo'],['abbonamento','💳 Abbonamento'],['sicurezza','🔒 Sicurezza']]
  const planColors: Record<string,string> = {TRIAL:'var(--amber-text)',ACTIVE:'var(--green-text)',PAST_DUE:'var(--red-text)',CANCELED:'var(--red-text)'}

  return (
    <div style={{maxWidth:720}}>
      {saved && <div style={{background:'#dcfce7',color:'#15803d',padding:'10px 16px',borderRadius:'var(--r)',marginBottom:14,fontSize:12,fontWeight:500}}>✓ Modifiche salvate</div>}

      <div style={{display:'flex',gap:2,marginBottom:20,borderBottom:'1px solid var(--border)',paddingBottom:0}}>
        {TABS.map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{padding:'9px 16px',fontSize:12,fontWeight:500,border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit',color:tab===v?'var(--ink)':'var(--ink3)',borderBottom:tab===v?'2px solid #22c55e':'2px solid transparent',marginBottom:-1}}>
            {l}
          </button>
        ))}
      </div>

      {tab==='azienda' && org && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:20}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Informazioni azienda</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['Nome azienda',org.name,'text'],['P.IVA',org.vatNumber||'','text'],['Email',org.email||'','email'],['Telefono',org.phone||'','text'],['Città',org.city||'','text']].map(([l,v,t])=>(
                <div key={l}><div style={{fontSize:11,color:'var(--ink3)',marginBottom:5}}>{l}</div><input type={t as string} style={inp} defaultValue={v as string} placeholder={l as string}/></div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button onClick={toast} style={{padding:'9px 22px',fontSize:13,fontWeight:600,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>Salva modifiche</button>
          </div>
        </div>
      )}

      {tab==='profilo' && user && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:20}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Il tuo profilo</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['Nome',user.name,'text'],['Email',user.email,'email'],['Reparto',user.department||'','text']].map(([l,v,t])=>(
                <div key={l}><div style={{fontSize:11,color:'var(--ink3)',marginBottom:5}}>{l}</div><input type={t as string} style={inp} defaultValue={v as string}/></div>
              ))}
              <div><div style={{fontSize:11,color:'var(--ink3)',marginBottom:5}}>Ruolo</div><div style={{padding:'8px 10px',background:'var(--card2)',border:'1px solid var(--border)',borderRadius:'var(--r)',fontSize:13,color:'var(--ink3)'}}>{user.role}</div></div>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button onClick={toast} style={{padding:'9px 22px',fontSize:13,fontWeight:600,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>Salva modifiche</button>
          </div>
        </div>
      )}

      {tab==='abbonamento' && org && (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div>
                <div style={{fontSize:18,fontWeight:600}}>Piano {org.plan} <span style={{fontSize:12,fontWeight:700,color:planColors[org.planStatus]||'var(--ink3)'}}>{org.planStatus}</span></div>
                <div style={{fontSize:12,color:'var(--ink3)',marginTop:2}}>Rinnovo automatico il 15 del mese</div>
              </div>
              <button style={{padding:'8px 16px',fontSize:12,fontWeight:600,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit'}}>Gestisci →</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              {[['Utenti',`${org.currentUsers} / ${org.maxUsers}`],['Piano',org.plan],['Stato',org.planStatus]].map(([l,v])=>(
                <div key={l} style={{background:'var(--card2)',borderRadius:'var(--r)',padding:'10px',textAlign:'center'}}>
                  <div style={{fontSize:16,fontWeight:600,fontFamily:'DM Mono,monospace'}}>{v as string}</div>
                  <div style={{fontSize:10,color:'var(--ink3)',marginTop:2}}>{l as string}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:20}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Fatture recenti</div>
            {['15 apr 2026','15 mar 2026','15 feb 2026'].map(d=>(
              <div key={d} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:12}}>{d}</div>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:12,fontWeight:500}}>€199</div>
                <span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#dcfce7',color:'#15803d'}}>Pagata</span>
                <button style={{padding:'3px 8px',fontSize:10,border:'1px solid var(--border2)',borderRadius:5,cursor:'pointer',background:'transparent',fontFamily:'inherit'}}>PDF</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='sicurezza' && (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:20}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Cambia password</div>
            <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:380}}>
              {[['Password attuale',''],['Nuova password','Minimo 8 caratteri'],['Conferma nuova password','']].map(([l,ph])=>(
                <div key={l}><div style={{fontSize:11,color:'var(--ink3)',marginBottom:5}}>{l}</div><input type="password" style={inp} placeholder={ph as string}/></div>
              ))}
              <button onClick={toast} style={{padding:'9px',fontSize:13,fontWeight:600,background:'#0c0c0a',color:'#fff',border:'none',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'inherit',marginTop:4}}>Aggiorna password</button>
            </div>
          </div>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:20}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Sessioni attive</div>
            {[['MacBook Pro — Chrome','Milano, IT','Ora (corrente)'],['iPhone — Safari','Milano, IT','2h fa'],['iPad — Safari','Roma, IT','Ieri']].map(([dev,loc,time])=>(
              <div key={dev as string} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{dev as string}</div><div style={{fontSize:10,color:'var(--ink3)'}}>{loc as string} · {time as string}</div></div>
                {time!=='Ora (corrente)'&&<button style={{padding:'3px 8px',fontSize:10,background:'#fee2e2',color:'#b91c1c',border:'1px solid rgba(239,68,68,0.3)',borderRadius:5,cursor:'pointer',fontFamily:'inherit'}}>Disconnetti</button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
