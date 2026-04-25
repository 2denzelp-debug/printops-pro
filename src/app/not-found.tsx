export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: 48, margin: 0 }}>404</h1>
          <p style={{ color: '#666' }}>Pagina non trovata</p>
          <a href="/dashboard" style={{ color: '#22c55e' }}>Torna alla dashboard</a>
        </div>
      </body>
    </html>
  )
}
