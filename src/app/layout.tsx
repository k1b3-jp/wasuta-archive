import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/next"
import supabase from '../utils/supabaseClient'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'わーすたアーカイブ',
  description: 'わーすたの過去のイベントや撮影動画が見つかるWebサイトです。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
