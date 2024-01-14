import DefaultLayout from '@/app/layout';
import MovieCard from '@/components/events/MovieCard';
import { useRouter } from 'next/router';
import { use, useEffect, useState } from 'react';
import { getMovies } from '@/lib/supabase/getMovies';
import { deleteYoutubeLink } from '@/lib/supabase/deleteYoutubeLink';

const EventMovieList = () => {
  const router = useRouter();
  const { id } = router.query;

  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (id !== undefined) {
        const fetchedMovies = await getMovies({ eventId: id });
        setMovies(fetchedMovies);
      }
    };

    if (id !== undefined) {
      fetchMovies();
    }
  }, [id]);

  const deleteMovie = async (youtubeLinkId) => {
    await deleteYoutubeLink(youtubeLinkId, id);
  };

  return (
    <DefaultLayout>
      <div>
        <main className="grid grid-cols-1 gap-4">
          {movies.map((movie) => (
            <div key={movie.youtube_link_id}>
              <MovieCard videoUrl={movie.youtube_links.url} />
              <button onClick={() => deleteMovie(movie.youtube_link_id)}>
                動画を削除する
              </button>
            </div>
          ))}
        </main>
      </div>
    </DefaultLayout>
  );
};

export default EventMovieList;
