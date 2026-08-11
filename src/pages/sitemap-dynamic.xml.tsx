import type { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabaseClient";

const escapeXml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
type Entry = { path: string; lastmod?: string | null };
const sitemap = (entries: Entry[]) =>
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((entry) => `  <url><loc>${escapeXml(`https://www.wasuta-archive.com${entry.path}`)}</loc>${entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod.slice(0, 10))}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>`;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	const [events, songs, costumes, members] = await Promise.all([
		supabase.from("events").select("event_id,date"),
		supabase
			.from("songs")
			.select("song_id,created_at")
			.eq("status", "published"),
		supabase
			.from("costumes")
			.select("costume_id,created_at")
			.eq("status", "published"),
		supabase
			.from("members")
			.select("timeline_key,updated_at")
			.not("timeline_key", "is", null),
	]);
	const entries: Entry[] = [
		...(events.data ?? []).map((item) => ({
			path: `/events/${item.event_id}`,
			lastmod: item.date,
		})),
		...(songs.data ?? []).map((item) => ({
			path: `/songs/${item.song_id}`,
			lastmod: item.created_at,
		})),
		...(costumes.data ?? []).map((item) => ({
			path: `/costumes/${item.costume_id}`,
			lastmod: item.created_at,
		})),
		...(members.data ?? []).map((item) => ({
			path: `/members/${item.timeline_key}`,
			lastmod: item.updated_at,
		})),
	];
	res.setHeader("Content-Type", "application/xml; charset=utf-8");
	res.setHeader(
		"Cache-Control",
		"public, s-maxage=3600, stale-while-revalidate=86400",
	);
	res.end(sitemap(entries));
	return { props: {} };
};
export default function DynamicSitemap() {
	return null;
}
