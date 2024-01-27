import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/app/layout';
import Tag from '@/components/ui/Tag';
import { getMovies } from '@/lib/supabase/getMovies';
import { getYoutubeTags } from '@/lib/supabase/getYoutubeTags';
import BaseButton from '@/components/ui/BaseButton';
import MovieCard from '@/components/events/MovieCard';

const EventListPage = () => {
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 初期ロード時に全イベントを取得
    fetchMovies();
    fetchAllTags();
  }, []);

  const fetchAllTags = async () => {
    const tags = await getYoutubeTags();
    setAllTags(tags);
  };

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    setError('');
    try {
      const moviesData = await getMovies({
        limit: 12,
        tags: selectedTags,
      });
      setMovies(moviesData);
    } catch (err) {
      setError('イベントの取得中にエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchMovies();
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
            {movies.length > 0 ? (
              movies.map((link) => (
                <div key={link.youtube_link_id} className="min-w-80">
                  <MovieCard videoUrl={link.youtube_links.url}></MovieCard>
                </div>
              ))
            ) : (
              <p>動画が見つかりませんでした😢</p>
            )}{' '}
          </main>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EventListPage;
