import { supabase } from '../supabaseClient';

export function validateUrl(url: string) {
  // YouTubeのビデオページ、短縮URL、埋め込みページの形式にマッチする正規表現を一つに組み合わせる
  const youtubeRegex =
    /^(https?:\/\/)?((www\.)?youtube\.com\/watch\?([^&]+&)*v=([^&]+)|youtu\.be\/([^?]+)|(www\.)?youtube\.com\/embed\/([^?]+))$/;

  return youtubeRegex.test(url);
}

export const createYoutubeLink = async (url: string, tags: string[], eventId: number) => {
  if (!validateUrl(url)) {
    throw new Error('URLが正しいYoutubeのリンクではありません');
  }

  // Youtubeリンクを追加
  const { data: linkData, error: linkError } = await supabase
    .from('youtube_links')
    .insert([{ url: url }])
    .select();

  if (linkError) throw linkError;

  // Youtubeタグを追加
  const youtubeTagData = tags.map((tagId) => ({
    youtube_link_id: linkData[0].youtube_link_id,
    tag_id: tagId,
  }));

  const { error: tagError } = await supabase.from('youtube_tags').insert(youtubeTagData);

  if (tagError) throw tagError;

  // イベントとYoutubeリンクを関連付け
  const { error: eventLinkError } = await supabase
    .from('event_youtube_links')
    .insert([{ event_id: eventId, youtube_link_id: linkData[0].youtube_link_id }]);

  if (eventLinkError) throw new Error(`Error linking Youtube to event: ${eventLinkError.message}`);
};

export default createYoutubeLink;
