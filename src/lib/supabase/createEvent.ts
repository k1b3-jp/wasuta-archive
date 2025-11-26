import { supabase } from "../supabaseClient";

interface EventData {
  eventName: string;
  date: string;
  location?: string;
  imageUrl?: string;
  description: string;
}

const createEvent = async (data: EventData, tags: number[]) => {
  const { eventName, date, location, imageUrl, description } = data;
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const res = await fetch("/api/events/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ eventName, date, location, imageUrl, description, tags }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "unknown" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.data;
};

export default createEvent;
