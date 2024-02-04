import { supabase } from '../supabaseClient';

export const deleteYoutubeLink = async (
  youtubeLinkId: number,
  eventId: number,
) => {
  // イベントとYoutubeリンクの関連付けを削除
  const { error: eventLinkError } = await supabase
    .from('event_youtube_links')
    .delete()
    .match({ event_id: eventId, youtube_link_id: youtubeLinkId });

  if (eventLinkError) {
    throw new Error(
      `Error unlinking Youtube from event: ${eventLinkError.message}`,
    );
  }

  // Youtubeタグを削除
  const { error: tagError } = await supabase
    .from('youtube_tags')
    .delete()
    .match({ youtube_link_id: youtubeLinkId });

  if (tagError) {
    throw new Error(`Error deleting Youtube tags: ${tagError.message}`);
  }

  // Youtubeリンクを削除
  const { error: linkError } = await supabase
    .from('youtube_links')
    .delete()
    .match({ youtube_link_id: youtubeLinkId });

  if (linkError) {
    throw new Error(`Error deleting Youtube link: ${linkError.message}`);
  }
};

export default deleteYoutubeLink;
