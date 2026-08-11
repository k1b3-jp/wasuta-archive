import type { NextApiRequest, NextApiResponse } from "next";
import {
	createAuthenticatedClient,
	getErrorMessage,
	isPositiveIntegerArray,
	isRateLimited,
	requireAdmin,
} from "@/lib/server/supabaseApi";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const supabase = createAuthenticatedClient(req, res);
	if (!supabase) return;
	const user = await requireAdmin(supabase, res);
	if (!user) return;
	if (req.method === "GET") {
		try {
			const [
				members,
				events,
				songs,
				costumes,
				eventRelations,
				songRelations,
				costumeRelations,
			] = await Promise.all([
				supabase
					.from("members")
					.select("member_id, name, timeline_key")
					.not("timeline_key", "is", null)
					.order("member_id"),
				supabase
					.from("events")
					.select("event_id, event_name, date")
					.order("date", { ascending: false }),
				supabase
					.from("songs")
					.select("song_id, title, first_performed_date, release_date")
					.order("first_performed_date", {
						ascending: false,
						nullsFirst: false,
					}),
				supabase
					.from("costumes")
					.select("costume_id, name, debut_date")
					.order("debut_date", { ascending: false, nullsFirst: false }),
				supabase.from("event_members").select("event_id, member_id"),
				supabase.from("song_members").select("song_id, member_id"),
				supabase.from("costume_members").select("costume_id, member_id"),
			]);
			const failed = [
				members,
				events,
				songs,
				costumes,
				eventRelations,
				songRelations,
				costumeRelations,
			].find((result) => result.error);
			if (failed?.error) throw failed.error;
			return res
				.status(200)
				.json({
					members: members.data,
					entities: {
						event: events.data,
						song: songs.data,
						costume: costumes.data,
					},
					relations: {
						event: eventRelations.data,
						song: songRelations.data,
						costume: costumeRelations.data,
					},
				});
		} catch (error) {
			return res.status(500).json({ error: getErrorMessage(error) });
		}
	}
	if (req.method !== "POST") return res.status(405).end();
	const { targetKind, targetId, memberIds } = req.body ?? {};
	if (
		!["event", "song", "costume"].includes(targetKind) ||
		!Number.isSafeInteger(targetId) ||
		targetId <= 0 ||
		!isPositiveIntegerArray(memberIds, 10)
	)
		return res.status(400).json({ error: "invalid member relation fields" });
	if (isRateLimited(`archive_member_relations:${user.id}`, 30))
		return res.status(429).json({ error: "rate limited" });
	try {
		const { error } = await supabase.rpc("replace_archive_member_relations", {
			target_kind: targetKind,
			target_id: targetId,
			selected_member_ids: memberIds,
		});
		if (error)
			return res
				.status(
					error.code === "42501" ? 403 : error.code === "P0002" ? 404 : 400,
				)
				.json({ error: error.message });
		return res.status(200).json({ ok: true });
	} catch (error) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
