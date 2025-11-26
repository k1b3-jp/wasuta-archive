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

  const { eventId, eventName, date, location, imageUrl, description, tags } = req.body ?? {};
  if (!eventId || !eventName || !date) return res.status(400).json({ error: "missing required fields" });

  try {
    const { error: updateError } = await supabase
      .from("events")
      .update({ event_name: eventName, date: new Date(date), location: location || "", image_url: imageUrl, description: description || "" })
      .eq("event_id", eventId);
    if (updateError) return res.status(500).json({ error: updateError.message });

    const { error: deleteTagError } = await supabase.from("event_tags").delete().match({ event_id: eventId });
    if (deleteTagError) return res.status(500).json({ error: deleteTagError.message });

    if (Array.isArray(tags) && tags.length > 0) {
      const eventTagData = tags.map((tagId: number) => ({ event_id: eventId, tag_id: tagId }));
      const { error: tagError } = await supabase.from("event_tags").insert(eventTagData);
      if (tagError) return res.status(500).json({ error: tagError.message });
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "unknown error" });
  }
}