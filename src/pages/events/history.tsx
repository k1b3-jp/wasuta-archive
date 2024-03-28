import DefaultLayout from "@/app/layout";
import { getEventTags } from "@/lib/supabase/getEventTags";
import { getEvents } from "@/lib/supabase/getEvents";
import type { Event } from "@/types/event";
import type { TagType } from "@/types/tag";
import { NextSeo } from "next-seo";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import HistoryItem from "@/components/events/HistoryItem";
import BaseButton from "@/components/ui/BaseButton";
import Tag from "@/components/ui/Tag";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

const EventListPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
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

  const fetchEvents = async (keyword = "") => {
    setLoading(true);
    setError("");
    try {
      const selectedTagIds = selectedTags.map((tag) => tag.id);
      const eventsData = await getEvents({
        keyword: keyword,
        startDate: startDate,
        endDate: endDate,
        tags: selectedTagIds,
        ascending: true,
      });
      setEvents(eventsData);
    } catch (err) {
      setError("イベントの取得中にエラーが発生しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // イベントを年度ごとにグルーピングする関数
  const groupEventsByYear = (events: Event[]): Record<number, Event[]> => {
    return events.reduce((acc: Record<number, Event[]>, event) => {
      const year = new Date(event.date).getFullYear(); // イベントの日付から年を取得
      if (!acc[year]) {
        acc[year] = []; // その年の配列がなければ作成
      }
      acc[year].push(event);
      return acc;
    }, {});
  };

  // EventListPage コンポーネント内のレンダリング部分
  const groupedEvents = groupEventsByYear(events); // イベントを年度ごとにグルーピング

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
              url: process.env.defaultOgpImage || "",
              width: 1200,
              height: 630,
              alt: "Og Image Alt",
            },
          ],
        }}
      />
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
                <div className="text-center">
                  <BaseButton onClick={handleSearch} label="検索" />
                </div>
              </div>
            </div>
            <main className="mb-10">
              {loading && <LoadingSpinner />}
              {error && <p className="text-red-500">{error}</p>}

              {Object.keys(groupedEvents)
                .sort()
                // .reverse()
                .map((year) => (
                  <div
                    key={year}
                    id={year}
                    className="px-8 bg-gradient bg-100vw"
                  >
                    <h2 className="flex flex-row flex-nowrap items-center my-10">
                      <span className="flex-grow block border-t border-deep-green" />
                      <span className="flex-none block mx-4 px-4 py-2.5 text-3xl font-bold leading-none text-deep-green">
                        {year}年
                      </span>
                      <span className="flex-grow block border-t border-deep-green" />
                    </h2>
                    <div className="container mx-auto space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                      {groupedEvents[Number(year)].map(
                        (event: {
                          event_id: string | undefined;
                          event_name: string | undefined;
                          location: string | undefined;
                          date: string | undefined;
                          image_url: string | undefined;
                          description: string | undefined;
                        }) => (
                          <HistoryItem
                            key={event.event_id}
                            title={event.event_name}
                            location={event.location}
                            date={event.date}
                            imageUrl={event.image_url}
                            id={event.event_id}
                            description={event.description}
                          />
                        )
                      )}
                    </div>
                  </div>
                ))}
            </main>
            <div className="fixed right-0 md:right-4 top-2/4 -translate-y-2/4 flex flex-col gap-3 bg-white font-light p-3 shadow-lg backdrop-blur-sm rounded-lg bg-opacity-10">
              {Object.keys(groupedEvents)
                .sort()
                .map((year) => (
                  <Link href={`#${year}`} className="">
                    {year}年
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default EventListPage;
