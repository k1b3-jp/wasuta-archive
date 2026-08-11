import type { NextApiRequest, NextApiResponse } from "next";
import {
	createAuthenticatedClient,
	getErrorMessage,
	isRateLimited,
	isSafeExternalHttpUrl,
	requireAuthenticatedUser,
} from "@/lib/server/supabaseApi";

const validSourceKinds = new Set([
	"official",
	"web",
	"video",
	"social",
	"book",
]);

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
		slug,
		title,
		kind,
		description,
		occurredOn,
		isGroupWide,
		sourceUrl,
		sourceTitle,
		sourceKind,
	} = req.body ?? {};

	if (
		typeof slug !== "string" ||
		!/^([a-z0-9]+)(-[a-z0-9]+)*$/.test(slug) ||
		typeof title !== "string" ||
		!title.trim() ||
		typeof kind !== "string" ||
		!kind.trim() ||
		typeof occurredOn !== "string" ||
		typeof sourceUrl !== "string" ||
		typeof sourceTitle !== "string" ||
		!sourceTitle.trim() ||
		typeof sourceKind !== "string" ||
		!validSourceKinds.has(sourceKind)
	) {
		return res.status(400).json({ error: "invalid milestone fields" });
	}

	if (Number.isNaN(new Date(`${occurredOn}T00:00:00`).getTime())) {
		return res.status(400).json({ error: "invalid milestone date" });
	}
	if (!isSafeExternalHttpUrl(sourceUrl)) {
		return res.status(400).json({ error: "invalid source URL" });
	}

	if (isRateLimited(`milestones_create:${user.id}`, 20)) {
		return res.status(429).json({ error: "rate limited" });
	}

	try {
		const { data, error } = await supabase.rpc("create_milestone_draft", {
			draft_slug: slug,
			draft_title: title.trim(),
			draft_kind: kind.trim(),
			draft_description:
				typeof description === "string" ? description.trim() : "",
			draft_occurred_on: occurredOn,
			draft_is_group_wide: isGroupWide === true,
			draft_source_url: sourceUrl,
			draft_source_title: sourceTitle.trim(),
			draft_source_kind: sourceKind,
		});
		if (error) {
			return res
				.status(error.code === "42501" ? 403 : 400)
				.json({ error: error.message });
		}
		return res.status(200).json({ milestoneId: Number(data) });
	} catch (error: unknown) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
