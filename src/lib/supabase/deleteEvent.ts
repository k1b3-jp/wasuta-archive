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

  try {
    // 画像URLの取得と削除
    const { data: imageUrl, error: imageError } = await supabase
      .from('events')
      .select('image_url')
      .eq('event_id', event_id)
      .single();
    if (imageError) throw new Error(`Failed to retrieve image URL: ${imageError.message}`);
    console.log(`Image URL retrieved successfully for event ID ${event_id}.`);

    if (imageUrl?.image_url) {
      const imagePath = extractPathFromUrl(imageUrl.image_url);
      if (imagePath) {
        const deletePics = await deleteStorage(imagePath, 'event_pics');
      }
    }

    // YouTubeリンクの取得と関連データの削除
    const { data: youtubeLinks, error: youtubeLinksError } = await supabase
      .from('event_youtube_links')
      .select('youtube_link_id')
      .eq('event_id', event_id);
    if (youtubeLinksError)
      throw new Error(`Failed to retrieve YouTube links: ${youtubeLinksError.message}`);

    if (youtubeLinks && youtubeLinks.length > 0) {
      for (const link of youtubeLinks) {
        const { error: deleteTagsError } = await supabase
          .from('youtube_tags')
          .delete()
          .eq('youtube_link_id', link.youtube_link_id);
        if (deleteTagsError)
          throw new Error(`Failed to delete YouTube tags: ${deleteTagsError.message}`);
      }

      const { error: deleteLinksError } = await supabase
        .from('event_youtube_links')
        .delete()
        .eq('event_id', event_id);
      if (deleteLinksError)
        throw new Error(`Failed to delete event YouTube links: ${deleteLinksError.message}`);

      for (const link of youtubeLinks) {
        const { error: deleteYTLinksError } = await supabase
          .from('youtube_links')
          .delete()
          .eq('youtube_link_id', link.youtube_link_id);
        if (deleteYTLinksError)
          throw new Error(`Failed to delete YouTube links: ${deleteYTLinksError.message}`);
      }
    }

    // イベントタグの削除
    const { error: deleteTagsError } = await supabase
      .from('event_tags')
      .delete()
      .eq('event_id', event_id);
    if (deleteTagsError) throw new Error(`Failed to delete event tags: ${deleteTagsError.message}`);

    // イベントの削除
    const { error: deleteEventError } = await supabase
      .from('events')
      .delete()
      .eq('event_id', event_id);
    if (deleteEventError) throw new Error(`Failed to delete event: ${deleteEventError.message}`);
    console.log(`All related data for event ID ${event_id} have been deleted successfully.`);
  } catch (error) {
    console.error('An error occurred during the deletion process:', error);
  }
};
