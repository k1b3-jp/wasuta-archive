import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import supabase from '../utils/supabaseClient';

const inter = Inter({ subsets: ['latin'] });

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
      <header style={{ padding: '20px', textAlign: 'center' }}>
        ヘッダーが入る
      </header>
      <main
        className={inter.className}
        style={{
          fontFamily: '"Your Custom Font", sans-serif',
          margin: 0,
          backgroundColor: '#F5F5F7',
          color: '#1C1C1E',
        }}
      >
        {children}
      </main>
      <footer>フッターが入る？</footer>
      <Analytics />
    </>
  );
}
