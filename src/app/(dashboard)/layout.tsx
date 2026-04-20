'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number | string
  dot?: boolean
  section?: string
}

function Icon({ d, size = 13 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  )
}

const NAV: NavItem[] = [
  { section: 'Principale', href: '/dashboard', label: 'Dashboard', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { href: '/dashboard/ai', label: 'Chat AI', icon: <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 8v4 M12 16h.01"/>, dot: true },
  { href: '/dashboard/team', label: 'Team Chat', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, dot: true },

  { section: 'CRM', href: '/dashboard/clienti', label: 'Clienti', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/dashboard/fornitori', label: 'Fornitori', icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/> },

  { section: 'Operativo', href: '/dashboard/preventivi', label: 'Preventivi', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { href: '/dashboard/ordini', label: 'Ordini', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
  { href: '/dashboard/produzione', label: 'Produzione', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, dot: true },

  { section: 'Specializzati', href: '/dashboard/dtf', label: 'DTF', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  { href: '/dashboard/adesivi', label: 'Adesivi', icon: <Icon d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5"/> },
  { href: '/dashboard/campioni', label: 'Campionature', icon: <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01"/> },

  { section: 'Magazzino', href: '/dashboard/magazzino', label: 'Stock', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>, dot: true },
  { href: '/dashboard/inchiostri', label: 'Inchiostri', icon: <Icon d="M12 2v10M12 2C12 2 6 9 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12z"/> },

  { section: 'Logistica', href: '/dashboard/spedizioni', label: 'Spedizioni', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },

  { section: 'Persone', href: '/dashboard/dipendenti', label: 'Dipendenti', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/dashboard/timbratura', label: 'Timbratura', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { href: '/dashboard/payroll', label: 'Pre-Payroll', icon: <Icon d="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/> },

  { section: 'Finanza', href: '/dashboard/finanza', label: 'Finanza', icon: <Icon d="M22 12h-4l-3 9L9 3l-3 9H2"/> },

  { section: 'Assistenza', href: '/dashboard/macchine', label: 'Macchine', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 17.66l-1.41 1.41M2 12H4M20 12h2M19.07 19.07l-1.41-1.41M5.34 6.34L3.93 4.93"/></svg> },
  { href: '/dashboard/impostazioni', label: 'Impostazioni', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 17.66l-1.41 1.41M2 12H4M20 12h2M19.07 19.07l-1.41-1.41M5.34 6.34L3.93 4.93"/></svg> },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/ai': 'Chat AI',
  '/dashboard/team': 'Team Chat',
  '/dashboard/clienti': 'CRM Clienti',
  '/dashboard/fornitori': 'CRM Fornitori',
  '/dashboard/preventivi': 'Preventivi',
  '/dashboard/ordini': 'Ordini',
  '/dashboard/produzione': 'Produzione',
  '/dashboard/dtf': 'DTF — Direct to Film',
  '/dashboard/adesivi': 'Adesivi & Sticker',
  '/dashboard/campioni': 'Campionature',
  '/dashboard/magazzino': 'Magazzino & Stock',
  '/dashboard/inchiostri': 'Inchiostri & Consumi',
  '/dashboard/spedizioni': 'Spedizioni',
  '/dashboard/dipendenti': 'Dipendenti',
  '/dashboard/timbratura': 'Timbratura',
  '/dashboard/payroll': 'Pre-Payroll',
  '/dashboard/finanza': 'Finanza interna',
  '/dashboard/macchine': 'Macchine & Assistenza',
  '/dashboard/impostazioni': 'Impostazioni',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [orgName, setOrgName] = useState('PrintOps Pro')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.org) setOrgName(d.org.name)
      if (d.user) setUserName(d.user.name)
    }).catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const title = PAGE_TITLES[pathname] || 'PrintOps Pro'
  const isFullPage = ['/dashboard/ai', '/dashboard/team'].includes(pathname)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 210, minWidth: 210, background: '#0c0c0a', display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: -0.3 }}>
            Print<span style={{ color: 'var(--green)', fontFamily: 'DM Mono, monospace', fontStyle: 'normal' }}>Ops</span>
            <span style={{ fontSize: 9, background: 'rgba(34,197,94,0.15)', color: 'var(--green)', padding: '1px 5px', borderRadius: 4, marginLeft: 6, fontFamily: 'DM Mono, monospace', verticalAlign: 'middle' }}>PRO</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{orgName}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 0', WebkitOverflowScrolling: 'touch' }}
          className="sidebar-nav">
          {NAV.map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const prevSection = idx > 0 ? NAV[idx - 1].section : null
            return (
              <div key={item.href}>
                {item.section && item.section !== prevSection && (
                  <div style={{ padding: '7px 13px 2px', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {item.section}
                  </div>
                )}
                <Link
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 13px',
                    fontSize: 12, textDecoration: 'none', position: 'relative', userSelect: 'none',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.38)',
                    background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--green)' : '2px solid transparent',
                    transition: 'all 0.1s',
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.dot && (
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                  )}
                  {typeof item.badge === 'number' && (
                    <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '1px 5px', borderRadius: 8, fontFamily: 'DM Mono, monospace' }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: '10px 13px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || 'Admin'}</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2, flexShrink: 0 }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{ height: 48, minHeight: 48, padding: '0 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', flexShrink: 0 }}>
          <h1 style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>{title}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--ink3)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
              Online
            </div>
            <NotificationBell />
            <Link href="/dashboard/impostazioni">
              <button style={{ padding: '5px 12px', fontSize: 11, fontWeight: 500, border: '1px solid var(--border2)', background: 'var(--card)', color: 'var(--ink)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
                Impostazioni
              </button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main style={{
          flex: 1,
          overflowY: isFullPage ? 'hidden' : 'auto',
          overflowX: 'hidden',
          padding: isFullPage ? 0 : '14px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
