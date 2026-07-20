import {
	createAuthenticatedClient,
	getErrorMessage,
	isAdmin,
	requireAuthenticatedUser,
} from "@/lib/server/supabaseApi";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	try {
		if (!req.headers.authorization) {
			return res.status(200).json({ isAdmin: false });
		}

		const supabase = createAuthenticatedClient(req, res);
		if (!supabase) return;
		const user = await requireAuthenticatedUser(supabase, res);
		if (!user) return;
		return res.status(200).json({ isAdmin: await isAdmin(supabase, user.id) });
	} catch (error: unknown) {
		return res
			.status(500)
			.json({ isAdmin: false, error: getErrorMessage(error) });
	}
}
