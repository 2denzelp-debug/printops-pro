import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PrintOps Pro',
  description: 'Sistema operativo per laboratori di stampa e ricamo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
