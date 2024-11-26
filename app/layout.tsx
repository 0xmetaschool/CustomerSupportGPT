import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Customer Support GPT',
  description: 'Build and deploy AI chatbots',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light" className="light">
      <body className={`${inter.className} bg-white [color-scheme:light]`}>
        <AuthProvider>
          <main className="bg-white min-h-screen [color-scheme:light]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
