import { Analytics } from '@vercel/analytics/react';
import { Noto_Sans_JP, Rubik } from 'next/font/google';
import React from 'react';
import '@/styles/globals.scss';
import { ToastContainer } from 'react-toastify';
import Footer from '@/components/navigation/Footer';
import NavBar from '@/components/navigation/NavBar';

import 'react-toastify/dist/ReactToastify.css';

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
        className={`${rubik.className} flex flex-col min-h-screen`}
      >
        <NavBar />
        <main className="flex-grow">
          <div className="container mx-auto">{children}</div>
        </main>
        <Footer />
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Analytics />
      </div>
    </>
  );
}
