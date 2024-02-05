import { supabase } from '../supabaseClient';

interface EventData {
  eventName: string;
  date: string;
  location?: string;
  imageUrl?: string;
  description: string;
}

const updateEvent = async (
  data: EventData,
  eventId: string,
  tags: number[],
) => {
  const { eventName, date, location, imageUrl, description } = data;

  try {
    // 既存のイベントを更新
    const { data: updatedData, error: updateError } = await supabase
      .from('events')
      .update({
        event_name: eventName,
        date: new Date(date),
        location,
        image_url: imageUrl,
        description,
      })
      .match({ event_id: eventId });

    if (updateError) throw updateError;

    // 既存のイベントタグを削除
    const { error: deleteTagError } = await supabase
      .from('event_tags')
      .delete()
      .match({ event_id: eventId });

    if (deleteTagError) throw deleteTagError;

    // 新しいイベントタグを挿入
    const eventTagData = tags.map((tagId) => ({
      event_id: eventId,
      tag_id: tagId,
    }));

    const { error: tagError } = await supabase
      .from('event_tags')
      .insert(eventTagData);

    if (tagError) throw tagError;

    return updatedData;
  } catch (error) {
    console.error('Error in updateEvent:', error);
    throw error;
  }
};

export default updateEvent;
