import { supabase } from "../supabaseClient";

export async function getEventsByYoutubeLink(youtubeLinkId: number) {
  const query = supabase
    .from("event_youtube_links")
    .select(
      `
            events (
                event_name
            )
        `
    )
    .eq("youtube_link_id", youtubeLinkId);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ? data[0].events : null;
}
