import type { NextApiRequest, NextApiResponse } from "next";
import {
	createAuthenticatedClient,
	getErrorMessage,
	isRateLimited,
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
	const milestoneId = Number(req.body?.milestoneId);
	const reason =
		typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
	if (
		!Number.isSafeInteger(milestoneId) ||
		milestoneId <= 0 ||
		reason.length < 3 ||
		reason.length > 500
	)
		return res
			.status(400)
			.json({ error: "破棄理由を3〜500文字で入力してください" });
	if (isRateLimited(`milestones_discard:${user.id}`, 10))
		return res.status(429).json({ error: "rate limited" });
	try {
		const { error } = await supabase.rpc("discard_milestone_draft", {
			milestone_to_discard: milestoneId,
			discard_reason: reason,
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
