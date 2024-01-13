import { supabase } from '../supabaseClient';

export const getMovies = async (eventId: number) => {
  const { data, error } = await supabase
    .from('event_youtube_links')
    .select(
      `
      youtube_link_id,
      youtube_links (
        url
      )
    `,
    )
    .eq('event_id', eventId);

  if (error) throw new Error(`Error fetching Youtube links: ${error?.message}`);
  return data;
};

export default getMovies;
