import { config } from '@fortawesome/fontawesome-svg-core';
import { Analytics } from '@vercel/analytics/react';
import { Noto_Sans_JP, Rubik } from 'next/font/google';
import { NextSeo } from 'next-seo';
import React from 'react';
import '@/styles/globals.scss';
import { ToastContainer } from 'react-toastify';
import BottomBar from '@/components/navigation/BottomBar';
import Footer from '@/components/navigation/Footer';
import NavBar from '@/components/navigation/NavBar';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;

const noto = Noto_Sans_JP({ subsets: ['latin'] });
const rubik = Rubik({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        style={{
          margin: 0,
        }}
        className={`${noto.className} flex flex-col min-h-screen`}
      >
        <NextSeo
          defaultTitle="わーすたアーカイブ"
          description="わーすたアーカイブはわーすたの動画がイベント毎に見つかるサイトです。タグで過去のライブを探したり、年表表示で歴史を振り返ることができます。"
          openGraph={{
            type: 'website',
            title: 'わーすたアーカイブ',
            description:
              'わーすたアーカイブはわーすたの動画がイベント毎に見つかるサイトです。タグで過去のライブを探したり、年表表示で歴史を振り返ることができます。',
            site_name: 'わーすたアーカイブ',
            url: 'https://www.wasuta-archive.com/',
            // images: [
            //   {
            //     url: 'https://www.example.ie/og-image-01.jpg',
            //     width: 800,
            //     height: 600,
            //     alt: 'Og Image Alt',
            //     type: 'image/jpeg',
            //   },
            // ],
          }}
          twitter={{
            handle: '@tws_kotaro',
            site: '@tws_kotaro',
            cardType: 'summary_large_image',
          }}
        />
        <NavBar />
        <main className="flex-grow">
          <div className="container mx-auto">{children}</div>
        </main>
        <BottomBar />
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
