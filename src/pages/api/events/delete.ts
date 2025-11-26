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

  const { eventId } = req.body ?? {};
  if (!eventId) return res.status(400).json({ error: "missing eventId" });

  const extractPathFromUrl = (url: string | URL): string | undefined => {
    try {
      const urlString = url instanceof URL ? url.href : url;
      const urlParts = new URL(urlString);
      const pathSegments = urlParts.pathname.split("/");
      const lastSegment = pathSegments.pop();
      return lastSegment || undefined;
    } catch {
      return undefined;
    }
  };

  try {
    const { data: imageUrl, error: imageError } = await supabase
      .from("events")
      .select("image_url")
      .eq("event_id", eventId)
      .single();
    if (imageError) return res.status(500).json({ error: imageError.message });

    if (imageUrl?.image_url) {
      const imagePath = extractPathFromUrl(imageUrl.image_url);
      if (imagePath) {
        const { error: storageError } = await supabase.storage.from("event_pics").remove([imagePath]);
        if (storageError) return res.status(500).json({ error: storageError.message });
      }
    }

    const { data: youtubeLinks, error: youtubeLinksError } = await supabase
      .from("event_youtube_links")
      .select("youtube_link_id")
      .eq("event_id", eventId);
    if (youtubeLinksError) return res.status(500).json({ error: youtubeLinksError.message });

    if (youtubeLinks && youtubeLinks.length > 0) {
      for (const link of youtubeLinks) {
        const { error: deleteTagsError } = await supabase
          .from("youtube_tags")
          .delete()
          .eq("youtube_link_id", link.youtube_link_id);
        if (deleteTagsError) return res.status(500).json({ error: deleteTagsError.message });
      }

      const { error: deleteLinksError } = await supabase
        .from("event_youtube_links")
        .delete()
        .eq("event_id", eventId);
      if (deleteLinksError) return res.status(500).json({ error: deleteLinksError.message });

      for (const link of youtubeLinks) {
        const { error: deleteYTLinksError } = await supabase
          .from("youtube_links")
          .delete()
          .eq("youtube_link_id", link.youtube_link_id);
        if (deleteYTLinksError) return res.status(500).json({ error: deleteYTLinksError.message });
      }
    }

    const { error: deleteTagsError2 } = await supabase
      .from("event_tags")
      .delete()
      .eq("event_id", eventId);
    if (deleteTagsError2) return res.status(500).json({ error: deleteTagsError2.message });

    const { error: deleteEventError } = await supabase.from("events").delete().eq("event_id", eventId);
    if (deleteEventError) return res.status(500).json({ error: deleteEventError.message });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "unknown error" });
  }
}