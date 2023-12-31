import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import supabase from '../lib/supabaseClient';
import styles from './layout.module.scss';
import '../styles/globals.scss';

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
      <div className={styles.container}>
        <header style={{ padding: '20px', textAlign: 'center' }}>
          ヘッダーが入る
        </header>
        <main
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
      </div>
    </>
  );
}
