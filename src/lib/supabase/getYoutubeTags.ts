import { supabase } from '../supabaseClient';

export const getYoutubeTags = async () => {
  let { data: tags, error } = await supabase
    .from('youtube_tag_names')
    .select('tag_id, name'); // tag_idとnameの両方を取得

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // タグのオブジェクトの配列を返す
  return tags?.map((tag) => ({
    id: tag.tag_id,
    label: tag.name,
  }));
};
