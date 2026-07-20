import {
	createAuthenticatedClient,
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

	const { path, bucketName } = req.body ?? {};
	if (!path || !bucketName)
		return res.status(400).json({ error: "missing path/bucketName" });

	const { error } = await supabase.storage.from(bucketName).remove([path]);
	if (error) return res.status(500).json({ error: error.message });
	return res.status(200).json({ ok: true });
}
