import type { NextApiRequest, NextApiResponse } from "next";
import { getCostumes } from "@/lib/supabase/getCostumes";
import { getEvents } from "@/lib/supabase/getEvents";
import { getSongs } from "@/lib/supabase/getSongs";
import { getTimelineMilestones } from "@/lib/supabase/getTimelineMilestones";
import { getTimelineMovies } from "@/lib/supabase/getTimelineMovies";

const csv = (value: unknown) =>
	`"${String(value ?? "").replaceAll('"', '""')}"`;
export default async function handler(
	_req: NextApiRequest,
	res: NextApiResponse,
) {
	try {
		const [events, videos, songs, costumes, milestones] = await Promise.all([
			getEvents({
				startDate: "2015-01-01",
				endDate: "2100-12-31",
				ascending: true,
			}),
			getTimelineMovies(),
			getSongs(),
			getCostumes(),
			getTimelineMilestones(),
		]);
		const rows: [
			[string, string, string, string, string],
			...Array<[string, string, string, string, string]>,
		] = [["type", "date", "title", "url", "source"]];
		for (const item of events)
			rows.push([
				"event",
				item.date,
				item.event_name,
				`https://www.wasuta-archive.com/events/${item.event_id}`,
				"",
			]);
		for (const item of videos)
			rows.push([
				"video",
				item.events?.date ?? "",
				item.events?.event_name ?? "",
				item.youtube_links?.url ?? "",
				"YouTube",
			]);
		for (const item of songs)
			rows.push([
				"song",
				item.first_performed_date ?? item.release_date ?? "",
				item.title,
				`https://www.wasuta-archive.com/songs/${item.song_id}`,
				item.song_sources?.[0]?.url ?? "",
			]);
		for (const item of costumes)
			rows.push([
				"costume",
				item.debut_date ?? "",
				item.name,
				`https://www.wasuta-archive.com/costumes/${item.costume_id}`,
				item.costume_sources?.[0]?.url ?? "",
			]);
		for (const item of milestones)
			rows.push([
				"milestone",
				item.occurred_on,
				item.title,
				`https://www.wasuta-archive.com/timeline?year=${item.occurred_on.slice(0, 4)}`,
				item.sources[0]?.url ?? "",
			]);
		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader(
			"Content-Disposition",
			'attachment; filename="wasuta-archive.csv"',
		);
		return res
			.status(200)
			.send(`\uFEFF${rows.map((row) => row.map(csv).join(",")).join("\n")}`);
	} catch (error) {
		console.error("Archive CSV export failed", error);
		return res.status(500).send("export failed");
	}
}
