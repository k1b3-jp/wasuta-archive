import { deleteStorage } from './deleteStorage';
import { supabase } from '../supabaseClient';

export const deleteEvent = async (event_id: number) => {
  const extractPathFromUrl = (url: string | URL): string | undefined => {
    try {
      const urlString = url instanceof URL ? url.href : url;
      const urlParts = new URL(urlString);
      const pathSegments = urlParts.pathname.split('/');
      const lastSegment = pathSegments.pop();
      return lastSegment || undefined;
    } catch (error) {
      console.error('Invalid URL provided:', url);
      return undefined;
    }
  };

  const { data: imageUrl, error } = await supabase
    .from('events')
    .select('image_url')
    .eq('event_id', event_id)
    .single();
  if (error) {
    console.error('Failed to retrieve image URL:', error.message);
  } else if (imageUrl?.image_url) {
    const imagePath = extractPathFromUrl(imageUrl.image_url);
    if (imagePath) {
      const deletePics = await deleteStorage(imagePath, 'event_pics');
    }
  }

  // Event_Youtube_Linksから該当のyoutube_link_idを取得
  const { data: youtubeLinks } = await supabase
    .from('event_youtube_links')
    .select('youtube_link_id')
    .eq('event_id', event_id);

  if (youtubeLinks) {
    // Youtube_Tagsを削除
    await Promise.all(
      youtubeLinks.map(async (link) => {
        await supabase
          .from('youtube_tags')
          .delete()
          .eq('youtube_link_id', link.youtube_link_id);
      }),
    );

    // Event_Youtube_Linksを削除
    await supabase
      .from('event_youtube_links')
      .delete()
      .eq('event_id', event_id);

    // Youtube_Linksを削除
    await Promise.all(
      youtubeLinks.map(async (link) => {
        await supabase
          .from('youtube_links')
          .delete()
          .eq('youtube_link_id', link.youtube_link_id);
      }),
    );
  }

  // Event_Tagsを削除
  await supabase.from('event_tags').delete().eq('event_id', event_id);

  // 最後に、Eventsを削除
  await supabase.from('events').delete().eq('event_id', event_id);

  console.log(`Event with ID ${event_id} and related data have been deleted.`);
};
