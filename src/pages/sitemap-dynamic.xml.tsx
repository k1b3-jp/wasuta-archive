import { supabase } from "@/lib/supabaseClient";
import type { GetServerSideProps } from "next";

async function getPages(): Promise<any[]> {
  const query = supabase.from("events").select("*");
  const { data: events, error } = await query;
  if (error) {
    console.error(`failed to fetch post data: ${error.message}`);
    return [];
  }
  if (!events) {
    console.warn("did not get any pages back");
    return [];
  }
  return events;
}

function getSitemap(events: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${events
      .map(
        (event) => `<url>
          <loc>'https://www.wasuta-archive.com/events/${event.event_id}'</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </url>,`
      )
      .join("")}
    </urlset>
  `;
}

export const getServerSideProps: GetServerSideProps<{}> = async ({ res }) => {
  res.setHeader("Content-Type", "text/xml");
  res.write(getSitemap(await getPages()));
  res.end();
  return {
    props: {},
  };
};

export default function Sitemap() {
  return null;
}
