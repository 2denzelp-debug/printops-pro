'use client'
import React, { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Errore login')
        return
      }
      window.location.href = '/dashboard'
    } catch {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>
          PrintOps PRO
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Accedi</div>
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>{error}</div>}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Slug azienda</label>
          <input style={{ width: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 12px', fontSize: 13, background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none' }} placeholder="printshop-demo" value={slug} onChange={e => setSlug(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Email</label>
          <input style={{ width: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 12px', fontSize: 13, background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none' }} type="email" placeholder="admin@printshop.it" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Password</label>
          <input style={{ width: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 12px', fontSize: 13, background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none' }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', fontSize: 13, fontWeight: 600, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          {loading ? 'Accesso...' : 'Accedi'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          Non hai un account? <Link href="/register" style={{ color: '#22c55e', textDecoration: 'none' }}>Registrati</Link>
        </div>
      </form>
    </div>
  )
}
