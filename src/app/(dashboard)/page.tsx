'use client'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        {[['Ordini attivi', '12', 'var(--ink)'], ['Urgenti', '3', 'var(--red-text)'], ['Stock critico', '5', 'var(--amber-text)'], ['Entrate mese', '€8.420', 'var(--green-text)']].map(([l, v, c]) => (
          <div key={l as string} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{l as string}</div>
            <div style={{ fontSize: 28, fontWeight: 600, fontFamily: 'DM Mono, monospace', color: c as string }}>{v as string}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Benvenuto in PrintOps Pro 🎉</div>
        <div style={{ fontSize: 13, color: 'var(--ink2)' }}>Il sistema è online e funzionante. Usa il menu a sinistra per navigare tra i moduli.</div>
      </div>
    </div>
  )
}
