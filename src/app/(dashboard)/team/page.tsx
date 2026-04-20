'use client'

import { useState, useEffect } from 'react'
import TeamChat from '@/components/TeamChat'

export default function TeamPage() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.user) setUser({ id: d.user.id, name: d.user.name }) })
  }, [])

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div style={{ height: 'calc(100vh - 48px)' }}>
      <TeamChat
        orgId=""
        currentUserId={user.id}
        currentUserName={user.name}
      />
    </div>
  )
}
