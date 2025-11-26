import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });

  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "admin")
    .limit(1);
  if (roleError) return res.status(500).json({ error: roleError.message });
  if (!roleRows || roleRows.length === 0) return res.status(403).json({ error: "forbidden" });

  const { youtubeLinkId, eventId } = req.body ?? {};
  if (!youtubeLinkId || !eventId) return res.status(400).json({ error: "missing required fields" });

  try {
    const { error: eventLinkError } = await supabase
      .from("event_youtube_links")
      .delete()
      .match({ event_id: Number(eventId), youtube_link_id: Number(youtubeLinkId) });
    if (eventLinkError) return res.status(500).json({ error: eventLinkError.message });

    const { error: tagError } = await supabase
      .from("youtube_tags")
      .delete()
      .match({ youtube_link_id: Number(youtubeLinkId) });
    if (tagError) return res.status(500).json({ error: tagError.message });

    const { error: linkError } = await supabase
      .from("youtube_links")
      .delete()
      .match({ youtube_link_id: Number(youtubeLinkId) });
    if (linkError) return res.status(500).json({ error: linkError.message });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "unknown error" });
  }
}