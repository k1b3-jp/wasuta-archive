import DefaultLayout from '@/app/layout';
import MovieCard from '@/components/events/MovieCard';
import { useRouter } from 'next/router';
import { use, useEffect, useState } from 'react';
import { getMovies } from '@/lib/supabase/getMovies';

const EventMovieList = () => {
  const router = useRouter();
  const { id } = router.query;

  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const fetchedMovies = await getMovies(id);
    setMovies(fetchedMovies);
    console.log('movies', fetchedMovies);
  };

  return (
    <DefaultLayout>
      <div>
        <main className="grid grid-cols-1 gap-4">
          {movies.map((movie) => (
            <MovieCard videoUrl={movie.youtube_links.url} />
          ))}
        </main>
      </div>
    </DefaultLayout>
  );
};

export default EventMovieList;
