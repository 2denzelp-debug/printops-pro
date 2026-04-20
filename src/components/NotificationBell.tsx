'use client'

import { useState, useEffect, useRef } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  body?: string
  refType?: string
  refId?: string
  isRead: boolean
  createdAt: string
}

const TYPE_ICONS: Record<string, string> = {
  task_assigned: '📋',
  task_completed: '✅',
  order_update: '📦',
  mention: '👤',
  system: '🔔',
  payment: '💳',
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'adesso'
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h fa`
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000) // poll ogni 15s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function load() {
    try {
      const res = await fetch('/api/team/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (e) { /* silenzioso */ }
  }

  async function markAllRead() {
    try {
      await fetch('/api/team/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      await load()
    } catch (e) { /* silenzioso */ }
  }

  async function markRead(id: string) {
    try {
      await fetch('/api/team/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) { /* silenzioso */ }
  }

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', padding: '6px 8px', border: '1px solid var(--border2)',
          borderRadius: 'var(--r)', background: 'var(--card)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff',
            fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--card)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 6, width: 340,
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)',
          zIndex: 999, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          {/* Header */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Notifiche {unreadCount > 0 && <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, marginLeft: 4 }}>{unreadCount}</span>}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 11, color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Segna tutte lette
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ maxHeight: 360, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px 14px', textAlign: 'center', fontSize: 12, color: 'var(--ink3)' }}>
                Nessuna notifica
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{
                    padding: '10px 14px', display: 'flex', gap: 10, cursor: 'pointer',
                    background: n.isRead ? 'transparent' : '#f0fdf4',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{TYPE_ICONS[n.type] || '🔔'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: n.isRead ? 400 : 600, lineHeight: 1.4 }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>}
                    <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 3 }}>{formatTime(n.createdAt)}</div>
                  </div>
                  {!n.isRead && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
