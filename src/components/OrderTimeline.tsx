'use client'

import { useState, useEffect } from 'react'

interface Activity {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  type: string
  content: string
  oldValue?: string
  newValue?: string
  attachmentUrl?: string
  createdAt: string
}

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  assignedTo?: string
  assignedName?: string
  dueDate?: string
  createdByName: string
  completedAt?: string
  comments: { id: string; userName: string; content: string; createdAt: string }[]
}

interface OrderTimelineProps {
  orderId: string
  orderCode: string
  currentUserId: string
  currentUserName: string
}

const ACTIVITY_ICONS: Record<string, string> = {
  STATUS_CHANGE: '🔄',
  COMMENT: '💬',
  FILE_UPLOAD: '📎',
  TASK_ASSIGNED: '📋',
  TASK_COMPLETED: '✅',
  PRODUCTION_UPDATE: '🏭',
  SHIPMENT_UPDATE: '🚚',
  INVOICE_SENT: '📄',
  NOTE: '📝',
  MENTION: '👤',
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  BASSA:   { bg: '#f1f0ec', text: '#5f5e5a', label: 'Bassa' },
  MEDIA:   { bg: '#dbeafe', text: '#1d4ed8', label: 'Media' },
  ALTA:    { bg: '#fef3c7', text: '#b45309', label: 'Alta' },
  CRITICA: { bg: '#fee2e2', text: '#b91c1c', label: 'Critica' },
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  APERTO:       { bg: '#f1f0ec', text: '#5f5e5a', label: 'Aperto' },
  IN_CORSO:     { bg: '#dbeafe', text: '#1d4ed8', label: 'In corso' },
  IN_REVISIONE: { bg: '#fef3c7', text: '#b45309', label: 'In revisione' },
  COMPLETATO:   { bg: '#dcfce7', text: '#15803d', label: 'Completato' },
  ANNULLATO:    { bg: '#fee2e2', text: '#b91c1c', label: 'Annullato' },
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'adesso'
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h fa`
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function OrderTimeline({ orderId, orderCode, currentUserId, currentUserName }: OrderTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [comment, setComment] = useState('')
  const [newTask, setNewTask] = useState({ title: '', assignedTo: '', dueDate: '', priority: 'MEDIA' })
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'timeline' | 'tasks'>('timeline')
  const [teamUsers, setTeamUsers] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [orderId])

  async function load() {
    try {
      const [timelineRes, usersRes] = await Promise.all([
        fetch(`/api/orders/timeline?orderId=${orderId}`),
        fetch('/api/team/channels'), // riuso per avere la lista utenti
      ])
      const tData = await timelineRes.json()
      setActivities(tData.activities || [])
      setTasks(tData.tasks || [])
    } catch (e) { console.error(e) }
  }

  async function addComment() {
    if (!comment.trim() || loading) return
    setLoading(true)
    try {
      await fetch('/api/orders/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, content: comment.trim(), type: 'COMMENT' }),
      })
      setComment('')
      await load()
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function createTask() {
    if (!newTask.title.trim()) return
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          refType: 'order',
          refId: orderId,
          refLabel: orderCode,
        }),
      })
      setNewTask({ title: '', assignedTo: '', dueDate: '', priority: 'MEDIA' })
      setShowTaskForm(false)
      await load()
    } catch (e) { console.error(e) }
  }

  async function updateTask(taskId: string, status: string) {
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      })
      await load()
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {(['timeline', 'tasks'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 16px', fontSize: 12, fontWeight: 500, border: 'none',
              background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
              color: activeTab === tab ? 'var(--ink)' : 'var(--ink3)',
              borderBottom: activeTab === tab ? '2px solid #22c55e' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {tab === 'timeline' ? '📅 Timeline' : '📋 Task'}
            {tab === 'tasks' && tasks.filter(t => t.status !== 'COMPLETATO' && t.status !== 'ANNULLATO').length > 0 && (
              <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8 }}>
                {tasks.filter(t => t.status !== 'COMPLETATO' && t.status !== 'ANNULLATO').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div style={{ padding: '14px 16px' }}>
            {activities.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--ink3)', fontSize: 12, padding: '24px 0' }}>
                Nessuna attività ancora. Aggiungi un commento qui sotto.
              </div>
            )}

            {activities.map((act, idx) => (
              <div key={act.id} style={{ display: 'flex', gap: 10, marginBottom: 16, position: 'relative' }}>
                {/* Linea verticale */}
                {idx < activities.length - 1 && (
                  <div style={{ position: 'absolute', left: 14, top: 28, bottom: -10, width: 1, background: 'var(--border)', zIndex: 0 }} />
                )}

                {/* Avatar + icona */}
                <div style={{ position: 'relative', flexShrink: 0, zIndex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: act.type === 'COMMENT' ? '#dbeafe' : act.type === 'TASK_COMPLETED' ? '#dcfce7' : act.type === 'FILE_UPLOAD' ? '#ede9fe' : '#fef3c7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                    border: '2px solid var(--card)',
                  }}>
                    {ACTIVITY_ICONS[act.type] || '•'}
                  </div>
                </div>

                {/* Contenuto */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{act.userName}</span>
                    <span style={{ fontSize: 10, color: 'var(--ink3)' }}>{formatTime(act.createdAt)}</span>
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--ink2)', lineHeight: 1.55,
                    background: act.type === 'COMMENT' ? 'var(--card)' : 'transparent',
                    border: act.type === 'COMMENT' ? '1px solid var(--border)' : 'none',
                    borderRadius: act.type === 'COMMENT' ? 8 : 0,
                    padding: act.type === 'COMMENT' ? '8px 10px' : 0,
                  }}>
                    {act.content}
                  </div>
                  {act.oldValue && act.newValue && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center', fontSize: 10 }}>
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: 4 }}>{act.oldValue}</span>
                      <span style={{ color: 'var(--ink3)' }}>→</span>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: 4 }}>{act.newValue}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Input commento */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e6f1fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#0c447c', flexShrink: 0 }}>
                  {getInitials(currentUserName)}
                </div>
                <div style={{ flex: 1, background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 8, overflow: 'hidden' }}>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment() } }}
                    placeholder={`Aggiungi un commento su ${orderCode}...`}
                    rows={1}
                    style={{ width: '100%', border: 'none', outline: 'none', padding: '8px 10px', fontSize: 12, fontFamily: 'inherit', resize: 'none', background: 'transparent', color: 'var(--ink)', minHeight: 36 }}
                  />
                  {comment.trim() && (
                    <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button onClick={() => setComment('')} style={{ padding: '3px 10px', fontSize: 11, border: '1px solid var(--border2)', borderRadius: 6, cursor: 'pointer', background: 'transparent', fontFamily: 'inherit' }}>Annulla</button>
                      <button onClick={addComment} disabled={loading} style={{ padding: '3px 10px', fontSize: 11, border: 'none', borderRadius: 6, cursor: 'pointer', background: '#0c0c0a', color: '#fff', fontFamily: 'inherit' }}>Invia</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{tasks.length} task totali</div>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                style={{ padding: '5px 12px', fontSize: 11, fontWeight: 500, background: '#0c0c0a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                + Nuovo task
              </button>
            </div>

            {/* Form nuovo task */}
            {showTaskForm && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <input
                  autoFocus
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="Titolo del task..."
                  style={{ width: '100%', border: '1px solid var(--border2)', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontFamily: 'inherit', marginBottom: 8, outline: 'none', background: 'var(--card)', color: 'var(--ink)' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                    style={{ border: '1px solid var(--border2)', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'inherit', background: 'var(--card)', color: 'var(--ink)' }}
                  >
                    {Object.entries(PRIORITY_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                    style={{ border: '1px solid var(--border2)', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'inherit', background: 'var(--card)', color: 'var(--ink)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowTaskForm(false)} style={{ padding: '5px 12px', fontSize: 11, border: '1px solid var(--border2)', borderRadius: 6, cursor: 'pointer', background: 'transparent', fontFamily: 'inherit' }}>Annulla</button>
                  <button onClick={createTask} style={{ padding: '5px 12px', fontSize: 11, background: '#0c0c0a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>Crea task</button>
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--ink3)', fontSize: 12, padding: '24px 0' }}>
                Nessun task per questo ordine. Creane uno!
              </div>
            )}

            {tasks.map(task => {
              const prio = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIA
              const stat = STATUS_COLORS[task.status] || STATUS_COLORS.APERTO
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETATO'
              return (
                <div key={task.id} style={{ background: 'var(--card)', border: `1px solid ${isOverdue ? '#fca5a5' : 'var(--border)'}`, borderRadius: 10, padding: 12, marginBottom: 8, borderLeft: `3px solid ${prio.bg === '#fee2e2' ? '#ef4444' : prio.bg === '#fef3c7' ? '#f59e0b' : prio.bg === '#dbeafe' ? '#3b82f6' : 'var(--border)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    {/* Checkbox */}
                    <div
                      onClick={() => updateTask(task.id, task.status === 'COMPLETATO' ? 'APERTO' : 'COMPLETATO')}
                      style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                        border: `2px solid ${task.status === 'COMPLETATO' ? '#22c55e' : 'var(--border2)'}`,
                        background: task.status === 'COMPLETATO' ? '#22c55e' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: '#fff',
                      }}
                    >
                      {task.status === 'COMPLETATO' && '✓'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, textDecoration: task.status === 'COMPLETATO' ? 'line-through' : 'none', color: task.status === 'COMPLETATO' ? 'var(--ink3)' : 'var(--ink)' }}>
                          {task.title}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: prio.bg, color: prio.text }}>
                          {prio.label}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: stat.bg, color: stat.text }}>
                          {stat.label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 10, color: 'var(--ink3)', flexWrap: 'wrap' }}>
                        {task.assignedName && <span>👤 {task.assignedName}</span>}
                        {task.dueDate && (
                          <span style={{ color: isOverdue ? '#b91c1c' : 'var(--ink3)' }}>
                            {isOverdue ? '⚠ ' : '📅 '}
                            Scadenza {new Date(task.dueDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        {task.completedAt && <span style={{ color: '#15803d' }}>✅ Completato {formatTime(task.completedAt)}</span>}
                      </div>

                      {task.comments.length > 0 && (
                        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                          {task.comments.slice(-2).map(c => (
                            <div key={c.id} style={{ fontSize: 11, color: 'var(--ink2)', marginBottom: 2 }}>
                              <span style={{ fontWeight: 500 }}>{c.userName}:</span> {c.content}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stato selector */}
                    {task.status !== 'COMPLETATO' && (
                      <select
                        value={task.status}
                        onChange={e => updateTask(task.id, e.target.value)}
                        style={{ fontSize: 10, border: '1px solid var(--border2)', borderRadius: 5, padding: '3px 6px', background: 'var(--card)', color: 'var(--ink)', fontFamily: 'inherit', flexShrink: 0 }}
                      >
                        {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
