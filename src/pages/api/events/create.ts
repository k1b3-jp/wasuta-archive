import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "unauthorized" });
  if (!supabaseUrl || supabaseUrl === "undefined" || !supabaseAnonKey || supabaseAnonKey === "undefined") {
    console.error("Supabase environment variables are missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return res.status(500).json({ error: "Server misconfiguration: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY" });
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return res.status(500).json({ error: userError.message });
  const currentUserId = userData?.user?.id;
  if (!currentUserId) return res.status(401).json({ error: "unauthorized" });

  const { eventName, date, location, imageUrl, description, tags } = req.body ?? {};
  if (!eventName || !date) return res.status(400).json({ error: "missing required fields" });
  const name = String(eventName).trim();
  if (name.length === 0 || name.length > 200) return res.status(400).json({ error: "invalid eventName" });
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return res.status(400).json({ error: "invalid date" });
  if (imageUrl) {
    try {
      const u = new URL(String(imageUrl));
      if (!/^https?:$/.test(u.protocol)) return res.status(400).json({ error: "invalid imageUrl" });
    } catch {
      return res.status(400).json({ error: "invalid imageUrl" });
    }
  }

  if (Array.isArray(tags) && tags.some((t: any) => typeof t !== "number" || t <= 0)) {
    return res.status(400).json({ error: "invalid tags" });
  }

  // simple per-user rate limiting (60s window, 30 requests)
  const now = Date.now();
  const windowMs = 60_000;
  const max = 30;
  ;(globalThis as any).__rate ||= new Map<string, { c: number; w: number }>();
  const rm: Map<string, { c: number; w: number }> = (globalThis as any).__rate;
  const k = `events_create:${currentUserId}`;
  const cur = rm.get(k) || { c: 0, w: now };
  if (now - cur.w > windowMs) { cur.c = 0; cur.w = now; }
  cur.c += 1; rm.set(k, cur);
  if (cur.c > max) return res.status(429).json({ error: "rate limited" });

  try {
    const { data: insertedData, error: eventInsertError } = await supabase
      .from("events")
      .insert([
        { event_name: name, date: parsedDate, location, image_url: imageUrl, description, created_by: currentUserId },
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
