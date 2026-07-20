import {
	createAuthenticatedClient,
	getErrorMessage,
	isPositiveIntegerArray,
	isRateLimited,
	requireAuthenticatedUser,
} from "@/lib/server/supabaseApi";
import type { NextApiRequest, NextApiResponse } from "next";

function validateUrl(url: string) {
	const youtubeRegex =
		/^(https?:\/\/)?((www\.|m\.)?youtube\.com\/watch\?.*v=([^&]+).*|youtu\.be\/([^?]+)(\?.*)?)$/;
	return youtubeRegex.test(url);
}

function cleanYouTubeUrl(url: string) {
	const urlObj = new URL(url);
	if (urlObj.hostname === "youtu.be") {
		const videoId = urlObj.pathname.substring(1);
		return `https://www.youtube.com/watch?v=${videoId}`;
	}
	urlObj.hostname = "www.youtube.com";
	const searchParams = urlObj.searchParams;
	for (const key of Array.from(searchParams.keys())) {
		if (key !== "v") searchParams.delete(key);
	}
	return urlObj.toString();
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") return res.status(405).end();

	const supabase = createAuthenticatedClient(req, res);
	if (!supabase) return;
	const user = await requireAuthenticatedUser(supabase, res);
	if (!user) return;

	if (isRateLimited(`youtube_create:${user.id}`, 60)) {
		return res.status(429).json({ error: "rate limited" });
	}

	let { url, tags, eventId } = req.body ?? {};
	if (!url || !eventId)
		return res.status(400).json({ error: "missing required fields" });
	const normalizedEventId = Number(eventId);
	if (!Number.isSafeInteger(normalizedEventId) || normalizedEventId <= 0) {
		return res.status(400).json({ error: "invalid eventId" });
	}
	if (tags !== undefined && !isPositiveIntegerArray(tags)) {
		return res.status(400).json({ error: "invalid tags" });
	}
	if (!validateUrl(url)) return res.status(400).json({ error: "invalid url" });
	url = cleanYouTubeUrl(url);

	try {
		const { data: linkData, error: linkError } = await supabase
			.from("youtube_links")
			.insert([{ url }])
			.select();
		if (linkError) return res.status(500).json({ error: linkError.message });

		const youtube_link_id = linkData?.[0]?.youtube_link_id;
		if (!youtube_link_id)
			return res.status(500).json({ error: "insert returned no id" });

		if (Array.isArray(tags) && tags.length > 0) {
			const youtubeTagData = tags.map((tagId: number) => ({
				youtube_link_id,
				tag_id: tagId,
			}));
			const { error: tagError } = await supabase
				.from("youtube_tags")
				.insert(youtubeTagData);
			if (tagError) {
				await supabase
					.from("youtube_links")
					.delete()
					.eq("youtube_link_id", youtube_link_id);
				return res.status(500).json({ error: tagError.message });
			}
		}

		const { error: eventLinkError } = await supabase
			.from("event_youtube_links")
			.insert([{ event_id: normalizedEventId, youtube_link_id }]);
		if (eventLinkError) {
			await supabase
				.from("youtube_tags")
				.delete()
				.eq("youtube_link_id", youtube_link_id);
			await supabase
				.from("youtube_links")
				.delete()
				.eq("youtube_link_id", youtube_link_id);
			return res.status(500).json({ error: eventLinkError.message });
		}

		return res.status(200).json({ ok: true });
	} catch (error: unknown) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
