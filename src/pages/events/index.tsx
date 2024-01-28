import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/app/layout';
import EventCard from '@/components/events/EventCard';
import Tag from '@/components/ui/Tag';
import { getEvents } from '@/lib/supabase/getEvents';
import { getEventTags } from '@/lib/supabase/getEventTags';
import BaseButton from '@/components/ui/BaseButton';
import useSWRInfinite from 'swr/infinite';

const EventListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
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

  type FetchEventsParams = {
    page: number;
    limit: number;
  };

  const fetchEvents = async ({ page, limit }: FetchEventsParams) => {
    const start = limit * page;
    const end = start + limit - 1;

    setLoading(true);
    setError('');
    try {
      const eventsData = await getEvents({
        keyword: searchTerm,
        startDate: startDate,
        endDate: endDate,
        tags: selectedTags,
        start: start,
        end: end,
      });
      return eventsData;
    } catch (err) {
      setError('イベントの取得中にエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [limit] = useState(10);
  const getKey = (pageIndex: number, previousPageData: any[]) => {
    if (previousPageData && !previousPageData.length) return null; // 最後に到達した
    return { page: pageIndex, limit: limit };
  };

  const {
    data: events,
    size,
    setSize,
    mutate,
  } = useSWRInfinite(getKey, fetchEvents);

  const handleSearch = () => {
    setSize(1).then(() => mutate());
  };

  return (
    <DefaultLayout>
      <div>
        <div className="mx-auto">
          <div className="search-form p-8 bg-light-pink bg-100vw flex">
            <div className="mx-auto bg-white p-8 rounded-lg border border-gray-100">
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
          <main className="event-list grid-base py-8">
            {loading && <p>読み込み中...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {events?.map((items) => {
              return items.map((event) => {
                return (
                  <EventCard
                    key={event.event_id}
                    title={event.event_name}
                    location={event.location}
                    date={event.date}
                    imageUrl={event.image_url}
                    id={event.event_id}
                  />
                );
              });
            })}
            <button
              className="flex items-center justify-center border-gray-200 px-4 py-2 rounded-md border hover:border-blue-400"
              onClick={() => {
                setSize(size + 1);
              }}
            >
              さらに読み込む
            </button>
          </main>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EventListPage;
