import type { NextApiRequest, NextApiResponse } from "next";
import {
	createAuthenticatedClient,
	getErrorMessage,
	isRateLimited,
	requireAuthenticatedUser,
} from "@/lib/server/supabaseApi";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") return res.status(405).end();
	const supabase = createAuthenticatedClient(req, res);
	if (!supabase) return;
	const user = await requireAuthenticatedUser(supabase, res);
	if (!user) return;
	const milestoneId = Number(req.body?.milestoneId);
	if (!Number.isSafeInteger(milestoneId) || milestoneId <= 0) {
		return res.status(400).json({ error: "invalid milestoneId" });
	}
	if (isRateLimited(`milestones_publish:${user.id}`, 20)) {
		return res.status(429).json({ error: "rate limited" });
	}

	try {
		const { error } = await supabase.rpc("confirm_and_publish_milestone", {
			milestone_to_publish: milestoneId,
		});
		if (error) {
			return res
				.status(error.code === "42501" ? 403 : 400)
				.json({ error: error.message });
		}
		return res.status(200).json({ ok: true });
	} catch (error: unknown) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
