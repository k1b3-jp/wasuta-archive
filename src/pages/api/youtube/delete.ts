import {
	createAuthenticatedClient,
	getErrorMessage,
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
	if (!(await requireAdmin(supabase, res))) return;

	const { youtubeLinkId, eventId } = req.body ?? {};
	if (!youtubeLinkId || !eventId)
		return res.status(400).json({ error: "missing required fields" });

	try {
		const { error: eventLinkError } = await supabase
			.from("event_youtube_links")
			.delete()
			.match({
				event_id: Number(eventId),
				youtube_link_id: Number(youtubeLinkId),
			});
		if (eventLinkError)
			return res.status(500).json({ error: eventLinkError.message });

		const { error: tagError } = await supabase
			.from("youtube_tags")
			.delete()
			.match({ youtube_link_id: Number(youtubeLinkId) });
		if (tagError) return res.status(500).json({ error: tagError.message });

		const { error: linkError } = await supabase
			.from("youtube_links")
			.delete()
			.match({ youtube_link_id: Number(youtubeLinkId) });
		if (linkError) return res.status(500).json({ error: linkError.message });

		return res.status(200).json({ ok: true });
	} catch (error: unknown) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
