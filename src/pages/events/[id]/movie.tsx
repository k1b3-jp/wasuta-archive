import DefaultLayout from '@/app/layout';
import MovieCard from '@/components/events/MovieCard';
import { useRouter } from 'next/router';
import { use, useEffect, useState } from 'react';
import { getMovies } from '@/lib/supabase/getMovies';
import { deleteYoutubeLink } from '@/lib/supabase/deleteYoutubeLink';
import { toast } from 'react-toastify';
import BaseButton from '@/components/ui/BaseButton';
import { getYoutubeTags } from '@/lib/supabase/getYoutubeTags';
import Tag from '@/components/ui/Tag';

const EventMovieList = () => {
  const router = useRouter();
  const { id } = router.query;

  const [movies, setMovies] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const fetchMovies = async (selectedTags?: string[]) => {
    if (id !== undefined) {
      const params = { eventId: id };
      if (selectedTags) {
        params['tags'] = selectedTags;
      }
      const fetchedMovies = await getMovies(params);
      setMovies(fetchedMovies);
    }
  };

  useEffect(() => {
    fetchAllTags();

    if (id !== undefined) {
      fetchMovies();
    }
  }, [id, refreshKey]);

  const deleteMovie = async (youtubeLinkId) => {
    try {
      await deleteYoutubeLink(youtubeLinkId, id);
      toast.success('動画が正常に削除されました');
      setRefreshKey((old) => old + 1);
    } catch (error) {
      toast.error('動画の削除中にエラーが発生しました');
    }
  };

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

  const handleSearch = () => {
    fetchMovies(selectedTags);
  };

  return (
    <DefaultLayout>
      <div>
        <div className="search-form p-8 bg-light-pink bg-100vw flex">
          <div className="mx-auto bg-white p-6 rounded-lg border border-gray-100 w-full">
            <div className="flex flex-wrap gap-2 mb-4">
              {allTags.map((tag) => (
                <Tag
                  key={tag.id} // タグのIDをkeyプロパティとして使用
                  label={tag.label} // タグの名前をlabelプロパティとして使用
                  selected={selectedTags.includes(tag.id)}
                  onSelect={() => handleTagSelect(tag.id)}
                />
              ))}
            </div>
            <BaseButton onClick={handleSearch} label="絞り込む" />
          </div>
        </div>
        <main className="event-list grid-base py-8">
          {movies.map((movie) => (
            <div key={movie.youtube_link_id}>
              <div className="mb-2">
                <MovieCard videoUrl={movie.youtube_links.url} />
              </div>
              <div className="flex justify-end">
                <div className="w-6/12">
                  <BaseButton
                    onClick={() => deleteMovie(movie.youtube_link_id)}
                    label="動画を削除する"
                  />
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </DefaultLayout>
  );
};

export default EventMovieList;
