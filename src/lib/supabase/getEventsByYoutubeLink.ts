import { supabase } from "../supabaseClient";

export async function getEventsByYoutubeLink(youtubeLinkId: number) {
  if (!Number.isInteger(youtubeLinkId)) {
    throw new Error("無効なYouTubeリンクIDです");
  }

  const query = supabase
    .from("event_youtube_links")
    .select(
      `
      event_id,
      events!inner(event_name)     
      `
    )
    .eq("youtube_link_id", youtubeLinkId);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
