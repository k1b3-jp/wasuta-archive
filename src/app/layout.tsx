import React, { useState } from 'react';
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
        <header className="bg-white flex justify-between items-center p-4">
          <div className="flex">
            <button className="text-gray-600 hover:text-gray-800 focus:outline-none focus:text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 6h13M8 12h13m-13 6h13"
                />
              </svg>
            </button>
          </div>
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
