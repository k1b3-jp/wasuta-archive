export interface Event {
  event_id: string;
  event_name: string;
  location: string;
  date: string;
  image_url: string;
  description: string;
}

export interface EventCard {
  key;
  title;
  location;
  date;
  imageUrl;
  id;
  description?: string;
}
