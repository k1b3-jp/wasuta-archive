import React from 'react';
import type { Metadata } from 'next';
import { Noto_Sans_JP, Rubik } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import styles from './layout.module.scss';
import '../styles/globals.scss';
import NavBar from '@/components/navigation/NavBar';
import Footer from '@/components/navigation/Footer';

const noto = Noto_Sans_JP({ subsets: ['latin'] });
const rubik = Rubik({ subsets: ['latin'] });

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
          margin: 0,
        }}
        className={rubik.className}
      >
        <NavBar />
        <main>
          <div className="container mx-auto">{children}</div>
        </main>
        <Footer />
        <Analytics />
      </div>
    </>
  );
}
