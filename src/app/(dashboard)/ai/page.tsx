'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  ts: string
}

const QUICK = [
  'Quali ordini sono urgenti oggi?',
  'Quanti articoli sono sotto scorta?',
  'Stato produzione attuale',
  'Macchine con problemi',
  'Ore dipendenti questa settimana',
  'Margine finanziario del mese',
  'Fammi un preventivo 80 t-shirt serigrafia 2 colori',
  'Quali task ho assegnati?',
  'Stock film DTF disponibile',
  'Dipendenti presenti oggi',
]

function now() {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Ciao! Sono l\'assistente AI di PrintOps Pro.\n\nHo accesso in tempo reale a tutti i dati del sistema: ordini, magazzino, produzione, dipendenti, macchine, finanza e task.\n\nCosa vuoi sapere?',
      ts: now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))
  const endRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text?: string) {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: msg, ts: now() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    // Placeholder risposta
    setMessages(prev => [...prev, { role: 'assistant', content: '...', ts: now() }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const reply = data.reply || 'Errore nella risposta.'
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: reply, ts: now() }])
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Errore di connessione. Riprova.', ts: now() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', background: 'var(--surface)' }}>

      {/* Messaggi */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, WebkitOverflowScrolling: 'touch' }}>
        {messages.map((m, i) => (
          <div key={i}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
              fontSize: 13,
              lineHeight: 1.6,
              background: m.role === 'user' ? '#0c0c0a' : 'var(--card)',
              color: m.role === 'user' ? '#fff' : 'var(--ink)',
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginLeft: m.role === 'user' ? 'auto' : 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {m.content === '...' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink3)' }}>
                  <span className="spinner" style={{ width: 12, height: 12 }} />
                  Elaboro con i dati reali...
                </span>
              ) : m.content}
            </div>
            <div style={{ fontSize: 9, color: 'var(--ink3)', marginTop: 2, textAlign: m.role === 'user' ? 'right' : 'left' }}>{m.ts}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick questions */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--card2)' }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} disabled={loading} style={{ padding: '4px 10px', fontSize: 10, fontWeight: 500, border: '1px solid var(--border2)', borderRadius: 20, cursor: 'pointer', background: 'var(--card)', color: 'var(--ink2)', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.1s' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={textRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Chiedi su ordini, magazzino, produzione, dipendenti, finanza... (Invio per inviare)"
            rows={1}
            disabled={loading}
            style={{ flex: 1, border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none', minHeight: 42, maxHeight: 100, color: 'var(--ink)', background: 'var(--card)' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{ padding: '9px 18px', fontSize: 12, fontWeight: 600, background: input.trim() && !loading ? '#0c0c0a' : 'var(--border)', color: input.trim() && !loading ? '#fff' : 'var(--ink3)', border: 'none', borderRadius: 'var(--r)', cursor: input.trim() && !loading ? 'pointer' : 'default', fontFamily: 'inherit', whiteSpace: 'nowrap', alignSelf: 'flex-end' }}
          >
            Invia ✦
          </button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 5 }}>
          L'AI legge i dati reali dal database. Non inventa informazioni.
        </div>
      </div>
    </div>
  )
}
