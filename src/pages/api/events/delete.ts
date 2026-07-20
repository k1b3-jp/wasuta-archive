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

	const { eventId } = req.body ?? {};
	if (!eventId) return res.status(400).json({ error: "missing eventId" });

	const extractPathFromUrl = (url: string | URL): string | undefined => {
		try {
			const urlString = url instanceof URL ? url.href : url;
			const urlParts = new URL(urlString);
			const pathSegments = urlParts.pathname.split("/");
			const lastSegment = pathSegments.pop();
			return lastSegment || undefined;
		} catch {
			return undefined;
		}
	};

	try {
		const { data: imageUrl, error: imageError } = await supabase
			.from("events")
			.select("image_url")
			.eq("event_id", eventId)
			.single();
		if (imageError) return res.status(500).json({ error: imageError.message });

		if (imageUrl?.image_url) {
			const imagePath = extractPathFromUrl(imageUrl.image_url);
			if (imagePath) {
				const { error: storageError } = await supabase.storage
					.from("event_pics")
					.remove([imagePath]);
				if (storageError)
					return res.status(500).json({ error: storageError.message });
			}
		}

		const { data: youtubeLinks, error: youtubeLinksError } = await supabase
			.from("event_youtube_links")
			.select("youtube_link_id")
			.eq("event_id", eventId);
		if (youtubeLinksError)
			return res.status(500).json({ error: youtubeLinksError.message });

		if (youtubeLinks && youtubeLinks.length > 0) {
			for (const link of youtubeLinks) {
				const { error: deleteTagsError } = await supabase
					.from("youtube_tags")
					.delete()
					.eq("youtube_link_id", link.youtube_link_id);
				if (deleteTagsError)
					return res.status(500).json({ error: deleteTagsError.message });
			}

			const { error: deleteLinksError } = await supabase
				.from("event_youtube_links")
				.delete()
				.eq("event_id", eventId);
			if (deleteLinksError)
				return res.status(500).json({ error: deleteLinksError.message });

			for (const link of youtubeLinks) {
				const { error: deleteYTLinksError } = await supabase
					.from("youtube_links")
					.delete()
					.eq("youtube_link_id", link.youtube_link_id);
				if (deleteYTLinksError)
					return res.status(500).json({ error: deleteYTLinksError.message });
			}
		}

		const { error: deleteTagsError2 } = await supabase
			.from("event_tags")
			.delete()
			.eq("event_id", eventId);
		if (deleteTagsError2)
			return res.status(500).json({ error: deleteTagsError2.message });

		const { error: deleteEventError } = await supabase
			.from("events")
			.delete()
			.eq("event_id", eventId);
		if (deleteEventError)
			return res.status(500).json({ error: deleteEventError.message });

		return res.status(200).json({ ok: true });
	} catch (error: unknown) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
