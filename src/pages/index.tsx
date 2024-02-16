import Image from 'next/image';
import DefaultLayout from '@/app/layout';
import EventCard from '@/components/events/EventCard';
import MovieCard from '@/components/events/MovieCard';
import BaseButton from '@/components/ui/BaseButton';
import CategoryCard from '@/components/ui/CategoryCard';
import { getEvents } from '@/lib/supabase/getEvents';
import { getMovies } from '@/lib/supabase/getMovies';
import { Event } from '@/types/event';
import { Movie } from '@/types/movie';
interface HomeProps {
  events: Event[];
  movies: Movie[];
}

export async function getStaticProps() {
  let events: any[] = [];
  let movies: any[] = [];

  try {
    events = await getEvents({
      limit: 6,
      byToday: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching events: ${error.message}`);
    }
  }

  try {
    // イベントに紐づくYouTubeリンクを取得
    movies = await getMovies({
      limit: 6,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching movies: ${error.message}`);
    }
  }

  return {
    props: {
      events,
      movies,
    },
  };
}

const HomePage: React.FC<HomeProps> = ({ events, movies }) => {
  return (
    <DefaultLayout>
      <div>
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
              src="/main-mockup.png"
              alt="スクリーンショット画像"
              width="1344"
              height="1920"
              className="translate-x-[7%] lg:translate-x-0"
            />
          </div>
        </section>
        <section className="flex flex-col bg-light-gray bg-100vw">
          <div className="container mx-auto p-6">
            <h3 className="text-xl font-bold text-font-color mb-6">カテゴリ</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <CategoryCard
                href="/events?tags=1"
                src="/concert.webp"
                alt="単独ライブのイメージ画像"
                title="単独ライブ"
                description="わーすたが主催する単独ライブやイベント"
              />
              <CategoryCard
                href="/events?tags=2"
                src="/release-event.webp"
                alt="リリイベのイメージ画像"
                title="リリイベ"
                description="CDリリースに際したイベント"
              />
              <CategoryCard
                href="/events?tags=3"
                src="/festival.webp"
                alt="対バンのイメージ画像"
                title="対バン"
                description="出演した対バンやフェス"
              />
              <CategoryCard
                href="/events?tags=4"
                src="/media.webp"
                alt="メディア出演のイメージ画像"
                title="メディア"
                description="各種メディア出演や配信"
              />
            </div>
          </div>
        </section>
        <section className="bg-100vw">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-font-color">新着動画</h3>
              <BaseButton label="もっと見る" link="/movies" />
            </div>
            <div
              style={{ marginRight: 'calc(50% - 50vw)' }}
              className="movie-list min-h-60 flex items-center overflow-scroll"
            >
              {movies.length > 0 ? (
                movies.map((link) => (
                  <div key={link.youtube_link_id} className="min-w-80 m-2">
                    <MovieCard
                      videoUrl={link.youtube_links.url}
                      id={link.youtube_link_id}
                    ></MovieCard>
                  </div>
                ))
              ) : (
                <p>動画が登録されていません😢</p>
              )}{' '}
            </div>
          </div>
        </section>
        <section className="">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-font-color">新着イベント</h3>
              <BaseButton label="もっと見る" link="/events" />
            </div>
            <div className="grid-base py-4">
              {events?.map((event) => (
                <EventCard
                  key={event.event_id}
                  title={event.event_name}
                  location={event.location}
                  date={event.date}
                  imageUrl={event.image_url}
                  id={event.event_id}
                />
              ))}
            </div>
            <div className="my-6 px-6 lg:w-1/3 lg:mx-auto">
              <BaseButton label="もっと見る" link="/events" />
            </div>
          </div>
        </section>
      </div>
    </DefaultLayout>
  );
};

export default HomePage;
