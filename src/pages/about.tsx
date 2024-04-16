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
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="font-heading mb-4 bg-deep-green text-white px-4 py-2 rounded-lg md:w-64 md:mx-auto text-xs font-semibold tracking-widest uppercase title-font">
                わーすたアーカイブとは？
              </h2>
              <p className="font-heading mt-2 text-3xl leading-8 font-semibold tracking-tight text-gray-900 sm:text-4xl">
                あの日のわーすた
                <br className="block md:hidden" />
                <span className="hidden md:inline">、</span>
                <span className="gradient-marker">動画で見つかる。</span>
              </p>
              <p className="mt-4 max-w-2xl text-lg text-gray-500 lg:mx-auto">
                わーすたアーカイブはわーすたの動画が
                イベント毎に見つかるサイトです。 タグで過去のライブを探したり、
                年表表示で歴史を振り返ることができます。
              </p>
            </div>
            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <dt>
                    <p className="font-heading text-lg leading-6 font-bold text-font-color">
                      イベント検索
                    </p>
                  </dt>
                  <dd className="mt-2 text-base text-gray-500">
                    当サイトのイベント検索機能を使って、わーすたの過去のライブやイベントを素早く簡単に見つけることができます。
                  </dd>
                </div>
                <div className="relative">
                  <dt>
                    <p className="font-heading text-lg leading-6 font-bold text-font-color">
                      動画アーカイブ
                    </p>
                  </dt>
                  <dd className="mt-2 text-base text-gray-500">
                    {" "}
                    過去のライブやイベントの動画を、簡単に検索することができます。
                  </dd>
                </div>
                <div className="relative">
                  <dt>
                    <p className="font-heading text-lg leading-6 font-bold text-font-color">
                      タグ検索
                    </p>
                  </dt>
                  <dd className="mt-2 text-base text-gray-500">
                    {" "}
                    特定のタグを使って、関連するイベントやライブを迅速に見つけることができます。
                  </dd>
                </div>
                <div className="relative">
                  <dt>
                    <p className="font-heading text-lg leading-6 font-bold text-font-color">
                      年表機能
                    </p>
                  </dt>
                  <dd className="mt-2 text-base text-gray-500">
                    {" "}
                    わーすたの歴史を年表形式で閲覧し、特定の年のイベントに素早くアクセスできます。
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </DefaultLayout>
    </>
  );
}
