import type { NextApiRequest, NextApiResponse } from "next";
import {
	createAuthenticatedClient,
	getErrorMessage,
	requireAdmin,
} from "@/lib/server/supabaseApi";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "GET") return res.status(405).end();
	const supabase = createAuthenticatedClient(req, res);
	if (!supabase) return;
	if (!(await requireAdmin(supabase, res))) return;
	const milestoneId = Number(req.query.id);
	if (!Number.isSafeInteger(milestoneId) || milestoneId <= 0)
		return res.status(400).json({ error: "invalid milestoneId" });
	try {
		const { data, error } = await supabase
			.from("archive_audit_log")
			.select("audit_id, action, from_status, to_status, reason, created_at")
			.eq("entity_type", "milestone")
			.eq("entity_id", milestoneId)
			.order("audit_id", { ascending: true });
		if (error) throw error;
		return res.status(200).json({ audit: data ?? [] });
	} catch (error) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
