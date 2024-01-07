import React from 'react';
import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import styles from './layout.module.scss';
import '../styles/globals.scss';
import NavBar from '@/components/navigation/NavBar';

const noto = Noto_Sans_JP({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'わーすたアーカイブ',
//   description: 'わーすたの過去のイベントや撮影動画が見つかるWebサイトです。',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        style={{
          fontFamily: '"Noto Sans JP", sans-serif',
          margin: 0,
          color: '#1C1C1E',
        }}
      >
        <NavBar />
        <main>
          <div className="container mx-auto">{children}</div>
        </main>
        <footer>フッターが入る？</footer>
        <Analytics />
      </div>
    </>
  );
}
