import { supabase } from '../supabaseClient';

interface GetMoviesOptions {
  eventId?: number;
  limit?: number;
  tags?: string[];
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

  if (options?.tags && options.tags.length > 0) {
    // Youtube_Tagsをフィルタリング
    const tagQuery = supabase
      .from('youtube_tags')
      .select('youtube_link_id')
      .in('tag_id', options.tags);

    const { data: tagData } = await tagQuery;
    let youtubeLinkIds: number[] = [];
    if (tagData) {
      youtubeLinkIds = tagData.map((tag) => tag.youtube_link_id);
    }

    // 結果をもとにメインクエリをフィルタリング
    query = query.in('youtube_link_id', youtubeLinkIds);
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
