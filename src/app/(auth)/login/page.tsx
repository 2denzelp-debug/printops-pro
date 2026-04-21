import React from 'react'
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [form, setForm] = useState({ slug: '', email: '', password: '' })
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
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Errore login'); return }
      window.location.href = '/dashboard'
    } catch {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, padding: '10px 12px', fontSize: 13,
    background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', transition: 'border 0.15s',
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: '#fff', letterSpacing: -0.5 }}>
          Print<span style={{ color: '#22c55e', fontFamily: 'DM Mono, monospace' }}>Ops</span>
          <span style={{ fontSize: 11, background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '2px 6px', borderRadius: 5, marginLeft: 8, fontFamily: 'DM Mono, monospace', verticalAlign: 'middle' }}>PRO</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
          Sistema operativo aziendale
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Accedi</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
          Demo: slug <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>printshop-demo</code>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Slug azienda</label>
          <input style={inp} placeholder="es. printshop-demo" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Email</label>
          <input style={inp} type="email" placeholder="admin@printshop.it" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Password</label>
          <input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', fontSize: 13, fontWeight: 600, background: loading ? 'rgba(34,197,94,0.5)' : '#22c55e', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer', fontFamily: 'DM Sans, sans
