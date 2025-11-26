import { supabase } from "../supabaseClient";

export const deleteEvent = async (event_id: number) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const res = await fetch("/api/events/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ eventId: event_id }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "unknown" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
};
