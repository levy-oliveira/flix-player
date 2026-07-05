import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flix Player',
  description: 'Assista filmes e séries online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  )
}