import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useSWRInfinite from 'swr/infinite';
import DefaultLayout from '@/app/layout';
import EventCard from '@/components/events/EventCard';
import BaseButton from '@/components/ui/BaseButton';
import Tag from '@/components/ui/Tag';
import { getEvents } from '@/lib/supabase/getEvents';
import { getEventTags } from '@/lib/supabase/getEventTags';
import { TagType } from '@/types/tag';

const EventListPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const query = useSearchParams();
  const toastParams = query?.get('toast');

  useEffect(() => {
    const queryTags = query?.get('tags');
    const queryTagIds = queryTags?.split(',').map((id) => parseInt(id, 10));

    const selectTagsById = () => {
      const selected = allTags.filter((tag) => queryTagIds?.includes(Number(tag.id)));
      setSelectedTags(selected);
    };

    selectTagsById();
  }, [allTags]);

  useEffect(() => {
    handleSearch();
  }, [selectedTags]);

  useEffect(() => {
    if (toastParams === 'eventDeleted') {
      toast.success('イベントを削除しました');
    }
    fetchAllTags();
  }, [toastParams]);

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
      const selectedTagIds = selectedTags.map((tag) => tag.id);
      const eventsData = await getEvents({
        keyword: searchTerm,
        startDate: startDate,
        endDate: endDate,
        tags: selectedTagIds,
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

  const [limit] = useState<number>(10);
  const getKey = (pageIndex: number, previousPageData: any[]) => {
    if (previousPageData && !previousPageData.length) return null; // 最後に到達した
    return { page: pageIndex, limit: limit };
  };

  const { data: events, size, setSize, mutate } = useSWRInfinite(getKey, fetchEvents);

  const handleSearch = () => {
    setSize(1).then(() => mutate());
  };

  return (
    <DefaultLayout>
      <div>
        <div className="mx-auto">
          <div className="search-form p-2 bg-light-gray bg-100vw flex">
            <div className="flex flex-col gap-4 mx-auto bg-white p-4 rounded-lg lg:w-[700px]">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold">タイトル</label>
                <input
                  className="bg-light-gray rounded-md p-3"
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold">期間</label>
                <div className="flex flex-row flex-nowrap items-center">
                  <input
                    className="bg-light-gray rounded-md p-3"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="mx-1">〜</span>
                  <input
                    className="bg-light-gray rounded-md p-3"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold">タグ</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {allTags.map((tag) => (
                    <Tag
                      key={tag.id}
                      label={tag.label}
                      selected={selectedTags.some((t) => t.id === tag.id)}
                      onSelect={() => handleTagSelect(tag)}
                    />
                  ))}
                </div>
              </div>
              <BaseButton onClick={handleSearch} label="検索" />
            </div>
          </div>
          <main className="event-list grid-base py-8">
            {loading && <p>読み込み中...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {events?.map((items) => {
              return items?.map(
                (event: {
                  event_id: any;
                  event_name: any;
                  location: any;
                  date: any;
                  image_url: any;
                }) => {
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
                },
              );
            })}
          </main>
          <div className="mx-auto mb-6 px-6 lg:w-1/2">
            <BaseButton
              label="もっと見る"
              onClick={() => {
                setSize(size + 1);
              }}
              white
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EventListPage;
