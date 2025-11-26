import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function validateUrl(url: string) {
  const youtubeRegex =
    /^(https?:\/\/)?((www\.|m\.)?youtube\.com\/watch\?.*v=([^&]+).*|youtu\.be\/([^?]+)(\?.*)?)$/;
  return youtubeRegex.test(url);
}

function cleanYouTubeUrl(url: string) {
  const urlObj = new URL(url);
  if (urlObj.hostname === "youtu.be") {
    const videoId = urlObj.pathname.substring(1);
    return `https://www.youtube.com/watch?v=${videoId}`;
  } else {
    urlObj.hostname = "www.youtube.com";
    const searchParams = urlObj.searchParams;
    const videoId = searchParams.get("v");
    searchParams.forEach((value, key) => {
      if (key !== "v") searchParams.delete(key);
    });
    return urlObj.toString();
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  if (!token) return res.status(401).json({ error: "unauthorized" });
  if (
    !supabaseUrl ||
    supabaseUrl === "undefined" ||
    !supabaseAnonKey ||
    supabaseAnonKey === "undefined"
  ) {
    console.error(
      "Supabase environment variables are missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return res.status(500).json({
      error:
        "Server misconfiguration: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    });
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return res.status(500).json({ error: userError.message });
  const currentUserId = userData?.user?.id;
  if (!currentUserId) return res.status(401).json({ error: "unauthorized" });

  // simple per-user rate limiting (60s window, 60 requests)
  const now = Date.now();
  const windowMs = 60_000;
  const max = 60;
  (globalThis as any).__rate ||= new Map<string, { c: number; w: number }>();
  const rm: Map<string, { c: number; w: number }> = (globalThis as any).__rate;
  const k = `youtube_create:${currentUserId}`;
  const cur = rm.get(k) || { c: 0, w: now };
  if (now - cur.w > windowMs) {
    cur.c = 0;
    cur.w = now;
  }
  cur.c += 1;
  rm.set(k, cur);
  if (cur.c > max) return res.status(429).json({ error: "rate limited" });

  let { url, tags, eventId } = req.body ?? {};
  if (!url || !eventId)
    return res.status(400).json({ error: "missing required fields" });
  if (!validateUrl(url)) return res.status(400).json({ error: "invalid url" });
  url = cleanYouTubeUrl(url);

  try {
    const { data: linkData, error: linkError } = await supabase
      .from("youtube_links")
      .insert([{ url }])
      .select();
    if (linkError) return res.status(500).json({ error: linkError.message });

    const youtube_link_id = linkData?.[0]?.youtube_link_id;
    if (!youtube_link_id)
      return res.status(500).json({ error: "insert returned no id" });

    if (Array.isArray(tags) && tags.length > 0) {
      const youtubeTagData = tags.map((tagId: number) => ({
        youtube_link_id,
        tag_id: tagId,
      }));
      const { error: tagError } = await supabase
        .from("youtube_tags")
        .insert(youtubeTagData);
      if (tagError) {
        await supabase
          .from("youtube_links")
          .delete()
          .eq("youtube_link_id", youtube_link_id);
        return res.status(500).json({ error: tagError.message });
      }
    }

    const { error: eventLinkError } = await supabase
      .from("event_youtube_links")
      .insert([{ event_id: Number(eventId), youtube_link_id }]);
    if (eventLinkError) {
      await supabase
        .from("youtube_tags")
        .delete()
        .eq("youtube_link_id", youtube_link_id);
      await supabase
        .from("youtube_links")
        .delete()
        .eq("youtube_link_id", youtube_link_id);
      return res.status(500).json({ error: eventLinkError.message });
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "unknown error" });
  }
}
