// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChessnKaffe',
  description: 'Find chess partners near you',
  icons: {
    icon: [
      { url: '/chessnkaffe-apple-icon.png' },
      { url: '/chessnkaffe-apple-icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/chessnkaffe-apple-icon.png',
    shortcut: '/chessnkaffe-apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}