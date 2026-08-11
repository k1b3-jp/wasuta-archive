import type { NextApiRequest, NextApiResponse } from "next";
import {
	createAuthenticatedClient,
	getErrorMessage,
	isRateLimited,
	isSafeExternalHttpUrl,
	requireAdmin,
} from "@/lib/server/supabaseApi";

const kinds = new Set(["song", "costume"]);
const sourceKinds = new Set(["official", "web", "video", "social", "book"]);
const validDate = (value: unknown) =>
	value === "" ||
	value == null ||
	(typeof value === "string" &&
		!Number.isNaN(new Date(`${value}T00:00:00`).getTime()));

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
			const [songs, costumes, events] = await Promise.all([
				supabase
					.from("songs")
					.select(
						"song_id, slug, title, release_date, first_performed_date, description, image_url, status, song_sources(source_id,label,url,verification_status,canonical_source_id), song_events(event_id,relation_type)",
					)
					.order("first_performed_date", {
						ascending: false,
						nullsFirst: false,
					}),
				supabase
					.from("costumes")
					.select(
						"costume_id, slug, name, debut_date, description, image_url, status, costume_sources(source_id,label,url,verification_status,canonical_source_id), costume_events(event_id,relation_type)",
					)
					.order("debut_date", { ascending: false, nullsFirst: false }),
				supabase
					.from("events")
					.select("event_id,event_name,date")
					.order("date", { ascending: false }),
			]);
			if (songs.error) throw songs.error;
			if (costumes.error) throw costumes.error;
			if (events.error) throw events.error;
			return res.status(200).json({
				songs: songs.data ?? [],
				costumes: costumes.data ?? [],
				events: events.data ?? [],
			});
		} catch (error) {
			return res.status(500).json({ error: getErrorMessage(error) });
		}
	}
	if (req.method !== "POST") return res.status(405).end();
	const {
		kind,
		recordId,
		slug,
		title,
		primaryDate,
		secondaryDate,
		description,
		imageUrl,
		sourceUrl,
		sourceTitle,
		sourceKind,
		publish,
		relatedEventId,
	} = req.body ?? {};
	if (
		!kinds.has(kind) ||
		(recordId != null && (!Number.isSafeInteger(recordId) || recordId <= 0)) ||
		(relatedEventId != null &&
			(!Number.isSafeInteger(relatedEventId) || relatedEventId <= 0)) ||
		typeof slug !== "string" ||
		!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
		typeof title !== "string" ||
		!title.trim() ||
		!validDate(primaryDate) ||
		!validDate(secondaryDate) ||
		typeof sourceUrl !== "string" ||
		typeof sourceTitle !== "string" ||
		!sourceTitle.trim() ||
		!sourceKinds.has(sourceKind) ||
		typeof publish !== "boolean"
	)
		return res.status(400).json({ error: "invalid archive record fields" });
	try {
		if (!isSafeExternalHttpUrl(sourceUrl)) throw new Error();
		if (imageUrl) {
			if (!isSafeExternalHttpUrl(imageUrl)) throw new Error();
		}
	} catch {
		return res.status(400).json({ error: "invalid URL" });
	}
	if (isRateLimited(`archive_records:${user.id}`, 30))
		return res.status(429).json({ error: "rate limited" });
	try {
		const { data, error } = await supabase.rpc(
			"save_archive_record_with_event",
			{
				record_kind: kind,
				record_id: recordId ?? null,
				record_slug: slug,
				record_title: title.trim(),
				record_primary_date: primaryDate || null,
				record_secondary_date: secondaryDate || null,
				record_description:
					typeof description === "string" ? description.trim() : "",
				record_image_url: typeof imageUrl === "string" ? imageUrl.trim() : "",
				record_source_url: sourceUrl,
				record_source_title: sourceTitle.trim(),
				record_source_kind: sourceKind,
				publish_record: publish,
				related_event_id: relatedEventId ?? null,
			},
		);
		if (error)
			return res
				.status(
					error.code === "42501" ? 403 : error.code === "P0002" ? 404 : 400,
				)
				.json({ error: error.message });
		return res.status(200).json({ recordId: Number(data) });
	} catch (error) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
