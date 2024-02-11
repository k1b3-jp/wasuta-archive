import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/app/layout';
import HistoryItem from '@/components/events/HistoryItem';
import BaseButton from '@/components/ui/BaseButton';
import Tag from '@/components/ui/Tag';
import { getEvents } from '@/lib/supabase/getEvents';
import { getEventTags } from '@/lib/supabase/getEventTags';
import { Event } from '@/types/event';
import { TagType } from '@/types/tag';

const EventListPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 初期ロード時に全イベントを取得
    fetchEvents();
    fetchAllTags();
  }, []);

  const fetchAllTags = async () => {
    const tags = await getEventTags();
    if (tags) {
      setAllTags(tags);
    }
  };

  const handleTagSelect = (tag: TagType) => {
    if (selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const fetchEvents = async (keyword = '') => {
    setLoading(true);
    setError('');
    try {
      const selectedTagIds = selectedTags.map((tag) => tag.id);
      const eventsData = await getEvents({
        keyword: keyword,
        limit: 12,
        startDate: startDate,
        endDate: endDate,
        tags: selectedTagIds,
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
          <div className="search-form mb-8 p-10 bg-light-gray bg-100vw flex">
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
                    key={tag.id}
                    label={tag.label}
                    selected={selectedTags.some((t) => t.id === tag.id)}
                    onSelect={() => handleTagSelect(tag)}
                  />
                ))}
              </div>
              <BaseButton onClick={handleSearch} label="検索" />
            </div>
          </div>
          <main className="p-10 mx-auto container">
            {loading && <p>読み込み中...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <ol className="relative border-s border-gray-200">
              {events.map((event) => (
                <HistoryItem
                  key={event.event_id}
                  title={event.event_name}
                  location={event.location}
                  date={event.date}
                  imageUrl={event.image_url}
                  id={event.event_id}
                  description={event.description}
                />
              ))}
            </ol>
          </main>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EventListPage;
