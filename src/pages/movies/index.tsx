import React, { useEffect, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import DefaultLayout from '@/app/layout';
import MovieCard from '@/components/events/MovieCard';
import BaseButton from '@/components/ui/BaseButton';
import Tag from '@/components/ui/Tag';
import { getMovies } from '@/lib/supabase/getMovies';
import { getYoutubeTags } from '@/lib/supabase/getYoutubeTags';
import { Movie } from '@/types/movie';
import { TagType } from '@/types/tag';

const EventListPage = () => {
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllTags();
  }, []);

  const fetchAllTags = async () => {
    const tags = await getYoutubeTags();
    if (tags !== undefined) {
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

  const fetchMovies = async ({ page, limit }: FetchEventsParams) => {
    const start = limit * page;
    const end = start + limit - 1;

    setLoading(true);
    setError('');
    try {
      const selectedTagIds = selectedTags.map((tag) => tag.id);
      const moviesData = await getMovies({
        tags: selectedTagIds,
        start: start,
        end: end,
      });
      return moviesData;
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

  const { data: movies, size, setSize, mutate } = useSWRInfinite<any>(getKey, fetchMovies);

  const handleSearch = () => {
    setSize(1).then(() => mutate());
  };

  return (
    <DefaultLayout>
      <div>
        <div className="mx-auto">
          <div className="search-form p-8 bg-light-pink bg-100vw flex">
            <div className="mx-auto bg-white p-10 rounded-lg border border-gray-100 w-full">
              <div className="flex flex-wrap gap-2 m-4">
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
          <main className="event-list grid-base py-10">
            {loading && <p>読み込み中...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {movies?.map((items) => {
              return items?.map((link: Movie) => {
                return (
                  <div key={link.youtube_link_id} className="min-w-80">
                    <MovieCard
                      videoUrl={link?.youtube_links?.url}
                      id={link.youtube_link_id}
                    ></MovieCard>
                  </div>
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
