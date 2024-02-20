import { Player } from '@lottiefiles/react-lottie-player';
import { NextSeo } from 'next-seo';
import DefaultLayout from '@/app/layout';
export default function Custom404() {
  return (
    <>
      <NextSeo title="404" />
      <DefaultLayout>
        <div className="px-4 pt-14 pb-4 text-center">
          <h1 className="text-2xl font-bold mb-8">ページが見つかりません😢</h1>
          <p className="mb-6">
            一時的にアクセスできない状況にあるか、移動もしくは削除された可能性があります。
          </p>
          <div className="lg:w-4/5 mx-auto">
            <Player
              autoplay
              loop
              src="https://lottie.host/81084f1d-3d95-40eb-93e8-d3abd149aa84/i6r6HoLdlM.json"
              style={{ height: '100%', width: '100%' }}
            ></Player>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
