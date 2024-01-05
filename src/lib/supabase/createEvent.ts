import { supabase } from '../supabaseClient';

interface EventData {
  eventName: string;
  eventTime: string;
  date: string;
  location: string;
  imageUrl: string;
  description: string;
}

const createEvent = async (data: EventData, userId: string) => {
  const { eventName, eventTime, date, location, imageUrl, description } = data;

  try {
    const { data: insertedData, error } = await supabase.from('Events').insert([
      {
        user_id: userId,
        event_name: eventName,
        event_time: eventTime,
        date: new Date(date),
        location,
        image_url: imageUrl,
        description,
      },
    ]);

    if (error) throw error;

    return insertedData;
  } catch (error) {
    console.error('Error in createEvent:', error);
    throw error;
  }
};

export default createEvent;
