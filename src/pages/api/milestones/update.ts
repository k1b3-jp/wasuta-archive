import type { NextApiRequest, NextApiResponse } from "next";
import {
	createAuthenticatedClient,
	getErrorMessage,
	isRateLimited,
	isSafeExternalHttpUrl,
	requireAuthenticatedUser,
} from "@/lib/server/supabaseApi";

const sourceKinds = new Set(["official", "web", "video", "social", "book"]);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") return res.status(405).end();
	const supabase = createAuthenticatedClient(req, res);
	if (!supabase) return;
	const user = await requireAuthenticatedUser(supabase, res);
	if (!user) return;
	const {
		milestoneId,
		title,
		kind,
		description,
		occurredOn,
		isGroupWide,
		sourceUrl,
		sourceTitle,
		sourceKind,
		revisionReason,
	} = req.body ?? {};
	if (
		!Number.isSafeInteger(milestoneId) ||
		milestoneId <= 0 ||
		typeof title !== "string" ||
		!title.trim() ||
		typeof kind !== "string" ||
		!kind.trim() ||
		typeof occurredOn !== "string" ||
		Number.isNaN(new Date(`${occurredOn}T00:00:00`).getTime()) ||
		typeof sourceUrl !== "string" ||
		typeof sourceTitle !== "string" ||
		!sourceTitle.trim() ||
		typeof sourceKind !== "string" ||
		!sourceKinds.has(sourceKind)
	)
		return res.status(400).json({ error: "invalid milestone fields" });
	if (!isSafeExternalHttpUrl(sourceUrl)) {
		return res.status(400).json({ error: "invalid source URL" });
	}
	if (isRateLimited(`milestones_update:${user.id}`, 30))
		return res.status(429).json({ error: "rate limited" });
	try {
		const revisingPublished =
			typeof revisionReason === "string" && revisionReason.trim().length > 0;
		const { error } = await supabase.rpc(
			revisingPublished
				? "revise_published_milestone"
				: "update_milestone_draft",
			revisingPublished
				? {
						milestone_to_revise: milestoneId,
						revised_title: title.trim(),
						revised_kind: kind.trim(),
						revised_description:
							typeof description === "string" ? description.trim() : "",
						revised_occurred_on: occurredOn,
						revised_is_group_wide: isGroupWide === true,
						revised_source_url: sourceUrl,
						revised_source_title: sourceTitle.trim(),
						revised_source_kind: sourceKind,
						revision_reason: revisionReason.trim(),
					}
				: {
						milestone_to_update: milestoneId,
						draft_title: title.trim(),
						draft_kind: kind.trim(),
						draft_description:
							typeof description === "string" ? description.trim() : "",
						draft_occurred_on: occurredOn,
						draft_is_group_wide: isGroupWide === true,
						draft_source_url: sourceUrl,
						draft_source_title: sourceTitle.trim(),
						draft_source_kind: sourceKind,
					},
		);
		if (error)
			return res
				.status(
					error.code === "42501" ? 403 : error.code === "P0002" ? 404 : 400,
				)
				.json({ error: error.message });
		return res.status(200).json({ milestoneId });
	} catch (error) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
