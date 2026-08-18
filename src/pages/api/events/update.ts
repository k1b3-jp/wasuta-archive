import {
	createAuthenticatedClient,
	getErrorMessage,
	isPositiveIntegerArray,
	isRateLimited,
	requireAdmin,
} from "@/lib/server/supabaseApi";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") return res.status(405).end();

	const supabase = createAuthenticatedClient(req, res);
	if (!supabase) return;
	const user = await requireAdmin(supabase, res);
	if (!user) return;

	const { eventId, eventName, date, location, imageUrl, description, tags } =
		req.body ?? {};
	if (!eventId || !eventName || !date)
		return res.status(400).json({ error: "missing required fields" });
	if (tags !== undefined && !isPositiveIntegerArray(tags)) {
		return res.status(400).json({ error: "invalid tags" });
	}
	const name = String(eventName).trim();
	if (name.length === 0 || name.length > 200)
		return res.status(400).json({ error: "invalid eventName" });
	const parsedDate = new Date(date);
	if (Number.isNaN(parsedDate.getTime()))
		return res.status(400).json({ error: "invalid date" });
	if (imageUrl) {
		try {
			const u = new URL(String(imageUrl));
			if (!/^https?:$/.test(u.protocol))
				return res.status(400).json({ error: "invalid imageUrl" });
		} catch {
			return res.status(400).json({ error: "invalid imageUrl" });
		}
	}

	if (isRateLimited(`events_update:${user.id}`, 60)) {
		return res.status(429).json({ error: "rate limited" });
	}

	try {
		const { error: updateError } = await supabase
			.from("events")
			.update({
				event_name: name,
				date: parsedDate,
				location: location || "",
				image_url: imageUrl,
				description: description || "",
				updated_by: user.id,
			})
			.eq("event_id", eventId);
		if (updateError)
			return res.status(500).json({ error: updateError.message });

		const { error: deleteTagError } = await supabase
			.from("event_tags")
			.delete()
			.match({ event_id: eventId });
		if (deleteTagError)
			return res.status(500).json({ error: deleteTagError.message });

		if (Array.isArray(tags) && tags.length > 0) {
			const eventTagData = tags.map((tagId: number) => ({
				event_id: eventId,
				tag_id: tagId,
			}));
			const { error: tagError } = await supabase
				.from("event_tags")
				.insert(eventTagData);
			if (tagError) return res.status(500).json({ error: tagError.message });
		}

		return res.status(200).json({ ok: true });
	} catch (error: unknown) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
