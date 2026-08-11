import type { NextApiRequest, NextApiResponse } from "next";
import {
	createAuthenticatedClient,
	getErrorMessage,
	isRateLimited,
	isSafeExternalHttpUrl,
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
		const { data, error } = await supabase
			.from("sources")
			.select(
				"source_id,url,title,source_kind,availability_status,archived_url,accessed_at,updated_at",
			)
			.order("updated_at", { ascending: false });
		if (error) return res.status(500).json({ error: error.message });
		return res.status(200).json({ sources: data ?? [] });
	}
	if (req.method !== "POST") return res.status(405).end();
	const sourceId = Number(req.body?.sourceId);
	const availability = req.body?.availability;
	const archivedUrl =
		typeof req.body?.archivedUrl === "string"
			? req.body.archivedUrl.trim()
			: "";
	if (
		!Number.isSafeInteger(sourceId) ||
		sourceId <= 0 ||
		!["unchecked", "available", "suspect", "unavailable"].includes(availability)
	)
		return res.status(400).json({ error: "invalid source state" });
	if (archivedUrl) {
		if (!isSafeExternalHttpUrl(archivedUrl)) {
			return res.status(400).json({ error: "invalid archived URL" });
		}
	}
	if (isRateLimited(`archive_sources:${user.id}`, 30))
		return res.status(429).json({ error: "rate limited" });
	try {
		const { error } = await supabase.rpc("update_source_state", {
			source_to_update: sourceId,
			next_availability: availability,
			next_archived_url: archivedUrl,
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
