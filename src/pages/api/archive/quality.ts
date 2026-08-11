import type { NextApiRequest, NextApiResponse } from "next";
import {
	createAuthenticatedClient,
	getErrorMessage,
	requireAdmin,
} from "@/lib/server/supabaseApi";
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "GET") return res.status(405).end();
	const supabase = createAuthenticatedClient(req, res);
	if (!supabase) return;
	if (!(await requireAdmin(supabase, res))) return;
	try {
		const [
			events,
			songs,
			costumes,
			milestones,
			sources,
			eventRelations,
			songRelations,
			costumeRelations,
		] = await Promise.all([
			supabase
				.from("events")
				.select("event_id", { count: "exact", head: true }),
			supabase
				.from("songs")
				.select("song_id", { count: "exact", head: true })
				.eq("status", "published"),
			supabase
				.from("costumes")
				.select("costume_id", { count: "exact", head: true })
				.eq("status", "published"),
			supabase
				.from("milestones")
				.select("milestone_id", { count: "exact", head: true })
				.eq("status", "published"),
			supabase.from("sources").select("source_id,availability_status"),
			supabase.from("event_members").select("event_id"),
			supabase.from("song_members").select("song_id"),
			supabase.from("costume_members").select("costume_id"),
		]);
		const failed = [
			events,
			songs,
			costumes,
			milestones,
			sources,
			eventRelations,
			songRelations,
			costumeRelations,
		].find((item) => item.error);
		if (failed?.error) throw failed.error;
		return res.status(200).json({
			counts: {
				events: events.count ?? 0,
				songs: songs.count ?? 0,
				costumes: costumes.count ?? 0,
				milestones: milestones.count ?? 0,
			},
			sources: {
				total: sources.data?.length ?? 0,
				unchecked:
					sources.data?.filter(
						(item) => item.availability_status === "unchecked",
					).length ?? 0,
				unavailable:
					sources.data?.filter(
						(item) => item.availability_status === "unavailable",
					).length ?? 0,
			},
			relations: {
				events: new Set(eventRelations.data?.map((item) => item.event_id)).size,
				songs: new Set(songRelations.data?.map((item) => item.song_id)).size,
				costumes: new Set(costumeRelations.data?.map((item) => item.costume_id))
					.size,
			},
		});
	} catch (error) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
