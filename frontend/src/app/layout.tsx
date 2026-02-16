import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AgentDocks.ai — Launch AI Agents in Seconds',
  description: 'Open source tool to run AI agents with a beautiful GUI. No terminal needed. Privacy first.',
  keywords: ['AI agents', 'Claude', 'OpenAI', 'Ollama', 'local AI', 'privacy', 'sandbox', 'open source'],
  authors: [{ name: 'AgentDocks Team' }],
  creator: 'AgentDocks',
  publisher: 'AgentDocks',
  icons: {
    icon: '/favicon.svg',
  },
  metadataBase: new URL('https://agentdocks.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://agentdocks.vercel.app',
    title: 'AgentDocks.ai — Launch AI Agents in Seconds',
    description: 'Open source tool to run AI agents with a beautiful GUI. No terminal needed. Privacy first.',
    siteName: 'AgentDocks',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'AgentDocks - Launch AI Agents in Seconds',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentDocks.ai — Launch AI Agents in Seconds',
    description: 'Open source tool to run AI agents with a beautiful GUI. No terminal needed. Privacy first.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
