import DefaultLayout from '../app/layout';
import { getEvents } from '../lib/supabase/getEvents';
import EventCard from '../components/events/EventCard';
import { Event } from '../types/event';
import MovieCard from '@/components/events/MovieCard';
import BaseButton from '@/components/ui/BaseButton';
import { getMovies } from '@/lib/supabase/getMovies';
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
        <section>{/* TODO:最新イベントのスライド？ */}</section>
        <section className="welcome p-10 flex flex-col">
          <h2 className="mx-auto text-4xl font-bold my-8 text-deep-pink">
            Welcome to Wasuta Archive!
          </h2>
          <p className="mx-auto my-8 text-center">
            わーすたの過去のイベントや撮影動画が見つかるWebサイトです。
            <br />
            イベントや動画の検索は上の検索バーからできます。
          </p>
        </section>
        <section className="bg-100vw bg-light-pink pt-4">
          <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-deep-pink">NEW MOVIE</h3>
              <BaseButton label="もっと見る" link="/movies" />
            </div>
            <div
              style={{ marginRight: 'calc(50% - 50vw)' }}
              className="movie-list min-h-60 flex items-center overflow-scroll mb-6"
            >
              {movies.length > 0 ? (
                movies.map((link) => (
                  <div key={link.youtube_link_id} className="min-w-80 m-2">
                    <MovieCard videoUrl={link.youtube_links.url}></MovieCard>
                  </div>
                ))
              ) : (
                <p>動画が登録されていません😢</p>
              )}{' '}
            </div>
          </div>
        </section>
        <section className="py-4">
          <div className="flex justify-between items-center mb-4 p-4">
            <h3 className="text-xl font-bold text-deep-pink">NEW EVENT</h3>
            <BaseButton label="もっと見る" link="/events" />
          </div>
          <div className="grid-base">
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
        </section>
      </div>
    </DefaultLayout>
  );
};

export default HomePage;
