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
