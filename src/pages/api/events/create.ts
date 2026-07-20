import {
	createAuthenticatedClient,
	getErrorMessage,
	isPositiveIntegerArray,
	isRateLimited,
	requireAuthenticatedUser,
} from "@/lib/server/supabaseApi";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") return res.status(405).end();

	const supabase = createAuthenticatedClient(req, res);
	if (!supabase) return;
	const user = await requireAuthenticatedUser(supabase, res);
	if (!user) return;

	const { eventName, date, location, imageUrl, description, tags } =
		req.body ?? {};
	if (!eventName || !date)
		return res.status(400).json({ error: "missing required fields" });
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

	if (tags !== undefined && !isPositiveIntegerArray(tags)) {
		return res.status(400).json({ error: "invalid tags" });
	}

	if (isRateLimited(`events_create:${user.id}`, 30)) {
		return res.status(429).json({ error: "rate limited" });
	}

	try {
		const { data: insertedData, error: eventInsertError } = await supabase
			.from("events")
			.insert([
				{
					event_name: name,
					date: parsedDate,
					location,
					image_url: imageUrl,
					description,
					created_by: user.id,
				},
			])
			.select();
		if (eventInsertError)
			return res.status(500).json({ error: eventInsertError.message });

		const eventId = insertedData?.[0]?.event_id;
		if (!eventId)
			return res.status(500).json({ error: "event insert returned no id" });

		if (Array.isArray(tags) && tags.length > 0) {
			const eventTagData = tags.map((tagId: number) => ({
				event_id: eventId,
				tag_id: tagId,
			}));
			const { error: tagError } = await supabase
				.from("event_tags")
				.insert(eventTagData);
			if (tagError) {
				await supabase.from("events").delete().eq("event_id", eventId);
				return res.status(500).json({ error: tagError.message });
			}
		}

		return res.status(200).json({ data: insertedData });
	} catch (error: unknown) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
