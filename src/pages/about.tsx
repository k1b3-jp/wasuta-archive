import { NextSeo } from "next-seo";
import DefaultLayout from "../app/layout";
import Image from "next/image";

export default function About() {
  return (
    <>
      <NextSeo
        title="わーすたアーカイブとは"
        openGraph={{
          images: [
            {
              url: process.env.defaultOgpImage || "",
              width: 1200,
              height: 630,
              alt: "Og Image Alt",
            },
          ],
        }}
      />
      <DefaultLayout>
        <section className="welcome px-4 pt-14 pb-4 lg:pb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between relative">
          <div>
            <h2 className="text-left text-3xl font-bold mb-6 text-font-color leading-normal">
              あの日のわーすた
              <br />
              <span className="gradient-marker">動画で見つかる。</span>
            </h2>
            <p className="mb-8 text-left text-sm font-bold leading-relaxed">
              わーすたアーカイブはわーすたの動画が
              <br />
              イベント毎に見つかるサイトです。
              <br />
              <br />
              タグで過去のライブを探したり、
              <br />
              年表表示で歴史を振り返ることができます。
            </p>
          </div>
          <div className="overflow-hidden lg:w-1/2 mr-[calc(50%-50vw)] lg:mr-0">
            <Image
              src="/main-mockup.webp"
              alt="スクリーンショット画像"
              width="1344"
              height="1920"
              className="translate-x-[7%] lg:translate-x-0"
            />
          </div>
        </section>
      </DefaultLayout>
    </>
  );
}
