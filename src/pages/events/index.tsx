import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/app/layout';
import EventCard from '@/components/events/EventCard';
import { getEvents } from '@/lib/supabase/getEvents';

const EventListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 初期ロード時に全イベントを取得
    fetchEvents();
  }, []);

  const fetchEvents = async (keyword = '') => {
    setLoading(true);
    setError('');
    try {
      const eventsData = await getEvents({
        keyword: keyword,
        limit: 12,
      });
      setEvents(eventsData);
    } catch (err) {
      setError('イベントの取得中にエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEvents(searchTerm);
  };

  return (
    <DefaultLayout>
      <div className="bg-gray-100 py-8">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <input
              className="border border-gray-300 rounded-md p-2"
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="p-2 bg-blue-500 text-white rounded-md ml-2"
            >
              検索
            </button>
          </div>
          <main className="grid grid-cols-1 gap-4">
            {loading && <p>読み込み中...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {events.map((event) => (
              <EventCard
                key={event.event_id}
                title={event.event_name}
                location={event.location}
                date={event.date}
                imageUrl={event.image_url}
                id={event.event_id}
              />
            ))}
          </main>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EventListPage;
