import DefaultLayout from '@/app/layout';
import MovieCard from '@/components/events/MovieCard';
import { useRouter } from 'next/router';
import { use, useEffect, useState, useCallback } from 'react';
import { getMovies } from '@/lib/supabase/getMovies';
import { deleteYoutubeLink } from '@/lib/supabase/deleteYoutubeLink';
import { toast } from 'react-toastify';
import BaseButton from '@/components/ui/BaseButton';
import { getYoutubeTags } from '@/lib/supabase/getYoutubeTags';
import Tag from '@/components/ui/Tag';
import { TagType } from '@/types/tag';
import { Movie } from '@/types/movie';

const EventMovieList = () => {
  const router = useRouter();
  const { id } = router?.query;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);

  type ParamsType = {
    eventId: number;
    tags?: string[];
  };

  const fetchMovies = useCallback(
    async (selectedTags?: TagType[]) => {
      if (id !== undefined) {
        const params: ParamsType = { eventId: Number(id) };
        if (selectedTags) {
          const selectedTagIds = selectedTags.map((tag) => tag.id);
          params['tags'] = selectedTagIds;
        }
        const fetchedMovies: Movie[] = await getMovies(params);
        setMovies(fetchedMovies);
      }
    },
    [id],
  ); // fetchMovies関数が依存する変数をここにリストします

  useEffect(() => {
    fetchAllTags();

    if (id !== undefined) {
      fetchMovies();
    }
  }, [id, refreshKey, fetchMovies]);

  const deleteMovie = async (youtubeLinkId: number) => {
    try {
      await deleteYoutubeLink(youtubeLinkId, Number(id));
      toast.success('動画が正常に削除されました');
      setRefreshKey((old) => old + 1);
    } catch (error) {
      toast.error('動画の削除中にエラーが発生しました');
    }
  };

  const fetchAllTags = async () => {
    const tags = await getYoutubeTags();
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
                  key={tag.id}
                  label={tag.label}
                  selected={selectedTags.some((t) => t.id === tag.id)}
                  onSelect={() => handleTagSelect(tag)}
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
