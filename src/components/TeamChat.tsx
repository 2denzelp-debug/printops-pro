'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  type: string
  refType?: string
  refId?: string
  refLabel?: string
  createdAt: string
  reactions?: { emoji: string; userId: string }[]
}

interface Channel {
  id: string
  name: string
  description?: string
  isDefault: boolean
  unreadCount: number
  type: string
}

interface TeamChatProps {
  orgId: string
  currentUserId: string
  currentUserName: string
}

const DEPT_COLORS: Record<string, string> = {
  'Direzione': '#8b5cf6',
  'Produzione': '#22c55e',
  'Reparto Grafico': '#f59e0b',
  'Magazzino': '#3b82f6',
  'Vendite': '#ef4444',
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const color = Object.values(DEPT_COLORS)[name.charCodeAt(0) % Object.values(DEPT_COLORS).length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color + '22',
      border: `1px solid ${color}44`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.35, fontWeight: '600',
      color, flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  )
}

export default function TeamChat({ orgId, currentUserId, currentUserName }: TeamChatProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { loadChannels() }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Polling messaggi ogni 3 secondi
  useEffect(() => {
    if (!activeChannel) return
    loadMessages(activeChannel.id)
    pollRef.current = setInterval(() => loadMessages(activeChannel.id), 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeChannel?.id])

  async function loadChannels() {
    try {
      const res = await fetch('/api/team/channels')
      const data = await res.json()
      setChannels(data.channels || [])
      if (!activeChannel && data.channels?.length > 0) {
        const def = data.channels.find((c: Channel) => c.isDefault) || data.channels[0]
        setActiveChannel(def)
      }
    } catch (e) { console.error(e) }
  }

  async function loadMessages(channelId: string) {
    try {
      const res = await fetch(`/api/team/messages?channelId=${channelId}&limit=60`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (e) { console.error(e) }
  }

  async function sendMessage() {
    if (!input.trim() || !activeChannel || loading) return
    setLoading(true)
    const content = input.trim()
    setInput('')
    try {
      await fetch('/api/team/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: activeChannel.id, content }),
      })
      await loadMessages(activeChannel.id)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function createChannel() {
    if (!newChannelName.trim()) return
    try {
      await fetch('/api/team/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newChannelName }),
      })
      setNewChannelName('')
      setShowNewChannel(false)
      await loadChannels()
    } catch (e) { console.error(e) }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) + ' ' +
      d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  function isSystemMsg(msg: Message) { return msg.type === 'SYSTEM' }
  function isMine(msg: Message) { return msg.userId === currentUserId }

  // Group consecutive messages from same user
  function shouldShowAvatar(msgs: Message[], idx: number) {
    if (idx === msgs.length - 1) return true
    return msgs[idx].userId !== msgs[idx + 1]?.userId
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--surface)', borderRadius: 'var(--rl)', overflow: 'hidden', border: '1px solid var(--border)' }}>

      {/* ── Sidebar canali ── */}
      <div style={{ width: 220, minWidth: 220, background: '#0c0c0a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>💬 Team Chat</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Chat interna PrintOps</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <div style={{ padding: '4px 14px 2px', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Canali</div>
          {channels.map(ch => (
            <div
              key={ch.id}
              onClick={() => setActiveChannel(ch)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                cursor: 'pointer', fontSize: 12,
                color: activeChannel?.id === ch.id ? '#fff' : 'rgba(255,255,255,0.45)',
                background: activeChannel?.id === ch.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                borderLeft: activeChannel?.id === ch.id ? '2px solid #22c55e' : '2px solid transparent',
                transition: 'all 0.1s',
              }}
            >
              <span style={{ opacity: 0.5 }}>#</span>
              <span style={{ flex: 1 }}>{ch.name}</span>
              {ch.unreadCount > 0 && (
                <span style={{ background: '#22c55e', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10, minWidth: 16, textAlign: 'center' }}>
                  {ch.unreadCount}
                </span>
              )}
            </div>
          ))}

          {showNewChannel ? (
            <div style={{ padding: '6px 14px', display: 'flex', gap: 4 }}>
              <input
                autoFocus
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createChannel(); if (e.key === 'Escape') setShowNewChannel(false) }}
                placeholder="nome-canale"
                style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5, padding: '4px 8px', color: '#fff', fontSize: 11, outline: 'none' }}
              />
            </div>
          ) : (
            <div onClick={() => setShowNewChannel(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              <span>+</span> Nuovo canale
            </div>
          )}
        </div>

        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={currentUserName} size={24} />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUserName}</div>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', marginLeft: 'auto', flexShrink: 0 }} />
        </div>
      </div>

      {/* ── Area messaggi ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header canale */}
        {activeChannel && (
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--card)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 16, color: 'var(--ink3)' }}>#</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{activeChannel.name}</div>
              {activeChannel.description && <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{activeChannel.description}</div>}
            </div>
          </div>
        )}

        {/* Messaggi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 2, WebkitOverflowScrolling: 'touch' }}>
          {messages.map((msg, idx) => {
            if (isSystemMsg(msg)) return (
              <div key={msg.id} style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink3)', padding: '4px 0', margin: '4px 0' }}>
                <span style={{ background: 'var(--card2)', padding: '2px 10px', borderRadius: 10, border: '1px solid var(--border)' }}>{msg.content}</span>
              </div>
            )

            const mine = isMine(msg)
            const showAv = shouldShowAvatar(messages, idx)
            const isNewDay = idx === 0 || new Date(messages[idx - 1]?.createdAt).toDateString() !== new Date(msg.createdAt).toDateString()

            return (
              <div key={msg.id}>
                {isNewDay && (
                  <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink3)', padding: '8px 0', marginBottom: 4 }}>
                    <span style={{ background: 'var(--card2)', padding: '2px 10px', borderRadius: 10, border: '1px solid var(--border)' }}>
                      {new Date(msg.createdAt).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: showAv ? 8 : 1, flexDirection: mine ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 28, flexShrink: 0 }}>
                    {showAv && !mine && <Avatar name={msg.userName} size={28} />}
                  </div>
                  <div style={{ maxWidth: '72%', minWidth: 0 }}>
                    {showAv && !mine && (
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)', marginBottom: 2, paddingLeft: 2 }}>
                        {msg.userName} <span style={{ fontWeight: 400, fontSize: 9 }}>{formatTime(msg.createdAt)}</span>
                      </div>
                    )}
                    <div style={{
                      background: mine ? '#0c0c0a' : 'var(--card)',
                      color: mine ? '#fff' : 'var(--ink)',
                      border: `1px solid ${mine ? '#0c0c0a' : 'var(--border)'}`,
                      borderRadius: mine ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                      padding: '8px 12px',
                      fontSize: 12,
                      lineHeight: 1.55,
                      wordBreak: 'break-word',
                    }}>
                      {msg.content}
                      {msg.refLabel && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          marginTop: 4, padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 600,
                          background: mine ? 'rgba(255,255,255,0.1)' : 'var(--card2)',
                          color: mine ? 'rgba(255,255,255,0.7)' : 'var(--ink3)',
                        }}>
                          🔗 {msg.refLabel}
                        </div>
                      )}
                    </div>
                    {mine && showAv && (
                      <div style={{ fontSize: 9, color: 'var(--ink3)', textAlign: 'right', marginTop: 2 }}>{formatTime(msg.createdAt)}</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {activeChannel && (
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: 'var(--card2)', borderRadius: 10, border: '1px solid var(--border2)', padding: '8px 12px' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={`Messaggio in #${activeChannel.name}... (Invio per inviare, Shift+Invio per nuova riga)`}
                rows={1}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 12, fontFamily: 'inherit', resize: 'none',
                  color: 'var(--ink)', minHeight: 20, maxHeight: 80,
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  padding: '5px 14px', fontSize: 11, fontWeight: 600,
                  background: input.trim() ? '#0c0c0a' : 'var(--border)',
                  color: input.trim() ? '#fff' : 'var(--ink3)',
                  border: 'none', borderRadius: 8, cursor: input.trim() ? 'pointer' : 'default',
                  transition: 'all 0.1s', flexShrink: 0,
                }}
              >
                {loading ? '...' : '→'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
