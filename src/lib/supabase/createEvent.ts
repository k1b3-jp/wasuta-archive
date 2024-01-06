import { supabase } from '../supabaseClient';

interface EventData {
  eventName: string;
  eventTime?: string;
  date: string;
  location?: string;
  imageUrl?: string;
  description: string;
}

const createEvent = async (data: EventData, userId: string, tags: number[]) => {
  const {
    eventName,
    eventTime,
    date,
    location,
    // imageUrl,
    description,
  } = data;

  try {
    const { data: insertedData, error: eventInsertError } = await supabase
      .from('events')
      .insert([
        {
          user_id: userId,
          event_name: eventName,
          event_time: eventTime,
          date: new Date(date),
          location,
          // image_url: imageUrl,
          description,
        },
      ])
      .select();

    if (eventInsertError) throw eventInsertError;

    // イベントタグを挿入
    const eventTagData = tags.map((tagId) => ({
      event_id: insertedData[0].event_id,
      tag_id: tagId,
    }));

    const { error: tagError } = await supabase
      .from('event_tags')
      .insert(eventTagData);

    if (tagError) throw tagError;

    return insertedData;
  } catch (error) {
    console.error('Error in createEvent:', error);
    throw error;
  }
};

export default createEvent;
