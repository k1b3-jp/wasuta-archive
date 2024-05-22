import { getServerSideSitemapIndex } from "next-sitemap";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const query = supabase.from("events").select("*");
  const { data: events, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  const pageData = events;

  const sitemapPaths = pageData.map(
    (event) => `https://www.wasuta-archive.com/events/${event.id}.xml`
  );
  return getServerSideSitemapIndex(sitemapPaths);
}
