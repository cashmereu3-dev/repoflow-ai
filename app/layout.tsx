import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'RepoFlow AI – Modern Collateral Recovery Platform',
  description:
    'AI-powered vehicle repossession, collateral recovery, and lender visibility platform. Built for the modern repo industry.',
  keywords: [
    'vehicle repossession',
    'collateral recovery',
    'repo management',
    'lender software',
    'repo agent app',
  ],
  openGraph: {
    title: 'RepoFlow AI',
    description: 'Modern AI-powered collateral recovery platform',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
