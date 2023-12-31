import DefaultLayout from '../app/layout';
import { getEvents } from '../lib/supabase/getEvents';
import EventCard from '../components/events/EventCard';
import { Event } from '../types/event';
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
        <h1>Welcome to Next.js!</h1>
        <p>This is the home page.</p>
        <section className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">新着動画</h3>
            <button className="text-blue-500">もっと見る</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* TODO: 動画コンポーネント一覧 */}
          </div>
        </section>
        <section className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">直近のイベント</h3>
            <button className="text-blue-500">もっと見る</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
