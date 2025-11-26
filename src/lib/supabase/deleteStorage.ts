import { supabase } from "../supabaseClient";

export const deleteStorage = async (path: string, bucketName: string) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const res = await fetch("/api/storage/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ path, bucketName }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "unknown" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return true;
};
