import type { NextApiRequest, NextApiResponse } from "next";
import {
	createAuthenticatedClient,
	getErrorMessage,
	requireAuthenticatedUser,
} from "@/lib/server/supabaseApi";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "GET") return res.status(405).end();
	const supabase = createAuthenticatedClient(req, res);
	if (!supabase) return;
	if (!(await requireAuthenticatedUser(supabase, res))) return;

	try {
		let query = supabase
			.from("milestones")
			.select(`milestone_id, slug, title, kind, description, status, updated_at,
				timeline_occurrences!inner(occurrence_id, occurred_on, is_group_wide, status,
					occurrence_sources(source_id, sources(source_id, url, title, source_kind)))`)
			.order("updated_at", { ascending: false });
		if (req.query.id) query = query.eq("milestone_id", Number(req.query.id));
		else query = query.eq("status", "draft");
		const { data, error } = await query;
		if (error) throw error;
		if (req.query.id && !data?.length)
			return res.status(404).json({ error: "not found" });
		return res.status(200).json({ milestones: data ?? [] });
	} catch (error) {
		return res.status(500).json({ error: getErrorMessage(error) });
	}
}
