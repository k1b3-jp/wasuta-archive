import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/app/layout';
import EventCard from '@/components/events/EventCard';
import Tag from '@/components/ui/Tag';
import { getEvents } from '@/lib/supabase/getEvents';
import { getEventTags } from '@/lib/supabase/getEventTags';
import BaseButton from '@/components/ui/BaseButton';

const EventListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 初期ロード時に全イベントを取得
    fetchEvents();
    fetchAllTags();
  }, []);

  const fetchAllTags = async () => {
    const tags = await getEventTags();
    setAllTags(tags);
  };

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const fetchEvents = async (keyword = '') => {
    setLoading(true);
    setError('');
    try {
      const eventsData = await getEvents({
        keyword: keyword,
        limit: 12,
        startDate: startDate,
        endDate: endDate,
        tags: selectedTags,
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
      <div>
        <div className="mx-auto">
          <div className="search-form mb-8 p-10 bg-bg-light-pink bg-100vw flex">
            <div className="mx-auto bg-white p-10 rounded-lg border border-gray-100">
              <input
                className="border border-gray-300 rounded-md p-2"
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <input
                className="border border-gray-300 rounded-md p-2 ml-2"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                className="border border-gray-300 rounded-md p-2 ml-2"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 my-4">
                {allTags.map((tag) => (
                  <Tag
                    key={tag.id} // タグのIDをkeyプロパティとして使用
                    label={tag.label} // タグの名前をlabelプロパティとして使用
                    selected={selectedTags.includes(tag.id)}
                    onSelect={() => handleTagSelect(tag.id)}
                  />
                ))}
              </div>
              <BaseButton onClick={handleSearch} label="検索" />
            </div>
          </div>
          <main className="event-list grid-base py-10">
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
