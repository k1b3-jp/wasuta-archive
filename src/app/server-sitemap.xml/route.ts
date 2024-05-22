import { type ISitemapField, getServerSideSitemap } from "next-sitemap";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const query = supabase.from("events").select("*");
    const { data: events, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    const pageData = events;

    const fields: ISitemapField[] = [];
    for (const page of pageData) {
      fields.push({
        loc: `https://www.wasuta-archive.com/events/${page.event_id}`,
        lastmod: new Date().toISOString(),
        priority: 1.0,
      });
    }

    return getServerSideSitemap(fields);
  } catch (err) {
    console.error("Error generating sitemap:", err);
    return {
      status: 500,
      body: `Error generating sitemap: ${err}`,
    };
  }
}
