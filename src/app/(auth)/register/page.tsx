'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ orgName: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Errore registrazione'); return }
      router.push('/dashboard')
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
    fontFamily: 'DM Sans, sans-serif',
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: '#fff' }}>
          Print<span style={{ color: '#22c55e', fontFamily: 'DM Mono, monospace' }}>Ops</span> Pro
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
          14 giorni gratuiti · Nessuna carta richiesta
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Crea il tuo account</div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 14 }}>
            {error}
          </div>
        )}

        {[
          { key: 'orgName', label: 'Nome azienda', placeholder: 'PrintShop srl', type: 'text' },
          { key: 'name', label: 'Il tuo nome', placeholder: 'Mario Rossi', type: 'text' },
          { key: 'email', label: 'Email', placeholder: 'mario@azienda.it', type: 'email' },
          { key: 'password', label: 'Password', placeholder: 'Minimo 8 caratteri', type: 'password' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 13 }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>{f.label}</label>
            <input
              style={inp}
              type={f.type}
              placeholder={f.placeholder}
              value={(form as Record<string, string>)[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              required
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '11px', fontSize: 13, fontWeight: 600, marginTop: 6,
            background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8,
            cursor: loading ? 'default' : 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {loading ? 'Creazione account...' : 'Inizia gratis →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          Hai già un account?{' '}
          <Link href="/login" style={{ color: '#22c55e', textDecoration: 'none' }}>Accedi</Link>
        </div>
      </form>
    </div>
  )
}
