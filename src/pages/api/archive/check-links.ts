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
	if (req.method !== "POST") return res.status(405).end();
	const supabase = createAuthenticatedClient(req, res);
	if (!supabase) return;
	const user = await requireAdmin(supabase, res);
	if (!user) return;
	if (isRateLimited(`archive_link_check:${user.id}`, 2))
		return res.status(429).json({ error: "rate limited" });
	try {
		const { data, error } = await supabase
			.from("sources")
			.select("source_id,url")
			.neq("source_kind", "internal")
			.order("updated_at", { ascending: true })
			.limit(50);
		if (error) throw error;
		const results = [];
		for (const source of data ?? []) {
			if (!isSafeExternalHttpUrl(source.url)) continue;
			let availability = "suspect";
			let status: number | null = null;
			try {
				const response = await fetch(source.url, {
					method: "HEAD",
					// Do not follow redirects: a public URL may redirect to a private host.
					redirect: "manual",
					signal: AbortSignal.timeout(8000),
					headers: { "User-Agent": "wasuta-archive-link-check/1.0" },
				});
				status = response.status;
				availability = response.ok
					? "available"
					: response.status === 404 || response.status === 410
						? "unavailable"
						: "suspect";
			} catch {
				availability = "suspect";
			}
			const { error: updateError } = await supabase.rpc("update_source_state", {
				source_to_update: source.source_id,
				next_availability: availability,
				next_archived_url: "",
			});
			if (updateError) throw updateError;
			results.push({
				sourceId: source.source_id,
				url: source.url,
				status,
				availability,
			});
		}
		return res.status(200).json({ checked: results.length, results });
	} catch (error) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
