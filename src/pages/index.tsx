import DefaultLayout from '../app/layout';
import { getEvents } from '../lib/supabase/getEvents';
import EventCard from '../components/events/EventCard';
import { Event } from '../types/event';
import MovieCard from '@/components/events/MovieCard';
import BaseButton from '@/components/ui/BaseButton';
interface HomeProps {
  events: any[];
}

export async function getStaticProps() {
  const events = await getEvents({
    limit: 6,
    byToday: true,
  });
  return {
    props: {
      events,
    },
  };
}

const HomePage: React.FC<HomeProps> = ({ events }) => {
  return (
    <DefaultLayout>
      <div>
        <section className="welcome p-10 flex flex-col">
          <h2 className="mx-auto text-4xl font-bold my-8">
            Welcome to Wasuta Archive!
          </h2>
          <p className="mx-auto my-8 text-center">
            わーすたの過去のイベントや撮影動画が見つかるWebサイトです。
            <br />
            イベントや動画の検索は上の検索バーからできます。
          </p>
        </section>
        <section className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">NEW MOVIE</h3>
            <BaseButton label="もっと見る" link="/movies" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* TODO: 動画コンポーネント一覧 */}
          </div>
        </section>
        <section className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">NEW EVENT</h3>
            <BaseButton label="もっと見る" link="/events" />
          </div>
          <div className="flex flex-wrap gap-10">
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
