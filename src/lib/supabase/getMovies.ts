import { supabase } from '../supabaseClient';

interface GetMoviesOptions {
  eventId?: number;
  limit?: number;
}

export const getMovies = async (options?: GetMoviesOptions) => {
  let query = supabase.from('event_youtube_links').select(
    `
      youtube_link_id,
      youtube_links (
        url
      )
    `,
  );

  if (options?.eventId) {
    query = query.eq('event_id', options.eventId);
  }

  // リミットが指定されていれば適用します
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data: movies, error } = await query;

  if (error) throw new Error(`Error fetching Youtube links: ${error?.message}`);
  return movies;
};

export default getMovies;
