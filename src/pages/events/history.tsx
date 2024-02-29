import { Player } from '@lottiefiles/react-lottie-player';
import { NextSeo } from 'next-seo';
import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/app/layout';
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
    <>
      <NextSeo
        title="年表"
        openGraph={{
          images: [
            {
              url: process.env.defaultOgpImage || '',
              width: 1200,
              height: 630,
              alt: 'Og Image Alt',
            },
          ],
        }}
      />
      <DefaultLayout>
        <div>
          <div className="px-4 pt-14 pb-4 text-center">
            <h1 className="text-2xl font-bold mb-8">準備中🙇‍♂️</h1>
            <p className="mb-6">鋭意開発中です。もうしばらくお待ちください。</p>
            <div className="lg:w-4/5 mx-auto">
              <Player
                autoplay
                loop
                src="https://lottie.host/e78d39ae-52c5-476e-b569-d97a591062b3/JfYmCDw0DB.json"
                style={{ height: '100%', width: '100%' }}
              ></Player>
            </div>
          </div>
          {/* <div className="mx-auto">
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
            <main className="p-10 mx-auto container">
              {loading && <p>読み込み中...</p>}
              {error && <p className="text-red-500">{error}</p>}

              <ol className="relative border-s border-gray-200 lg:max-w-sm lg:mx-auto">
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
          </div> */}
        </div>
      </DefaultLayout>
    </>
  );
};

export default EventListPage;
