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

  // 管理者チェック
  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "admin")
    .limit(1);
  if (roleError) return res.status(500).json({ error: roleError.message });
  if (!roleRows || roleRows.length === 0) return res.status(403).json({ error: "forbidden" });

  const { eventName, date, location, imageUrl, description, tags } = req.body ?? {};
  if (!eventName || !date) return res.status(400).json({ error: "missing required fields" });

  try {
    const { data: insertedData, error: eventInsertError } = await supabase
      .from("events")
      .insert([
        { event_name: eventName, date: new Date(date), location, image_url: imageUrl, description },
      ])
      .select();
    if (eventInsertError) return res.status(500).json({ error: eventInsertError.message });

    const eventId = insertedData?.[0]?.event_id;
    if (!eventId) return res.status(500).json({ error: "event insert returned no id" });

    if (Array.isArray(tags) && tags.length > 0) {
      const eventTagData = tags.map((tagId: number) => ({ event_id: eventId, tag_id: tagId }));
      const { error: tagError } = await supabase.from("event_tags").insert(eventTagData);
      if (tagError) {
        await supabase.from("events").delete().eq("event_id", eventId);
        return res.status(500).json({ error: tagError.message });
      }
    }

    return res.status(200).json({ data: insertedData });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "unknown error" });
  }
}