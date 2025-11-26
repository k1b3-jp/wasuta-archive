import { supabase } from "../supabaseClient";

export const deleteYoutubeLink = async (youtubeLinkId: number, eventId: number) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const res = await fetch("/api/youtube/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ youtubeLinkId, eventId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "unknown" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
};

export default deleteYoutubeLink;
