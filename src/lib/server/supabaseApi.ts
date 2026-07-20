import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const RATE_LIMIT_WINDOW_MS = 60_000;

type RateLimitEntry = {
	count: number;
	windowStartedAt: number;
};

const rateLimits = new Map<string, RateLimitEntry>();

function getSupabaseConfig() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url || url === "undefined" || !anonKey || anonKey === "undefined") {
		return null;
	}

	return { url, anonKey };
}

export function getBearerToken(req: NextApiRequest) {
	const authorization = req.headers.authorization;
	return authorization?.startsWith("Bearer ")
		? authorization.slice("Bearer ".length)
		: null;
}

export function createAuthenticatedClient(
	req: NextApiRequest,
	res: NextApiResponse,
): SupabaseClient | null {
	const token = getBearerToken(req);
	if (!token) {
		res.status(401).json({ error: "unauthorized" });
		return null;
	}

	const config = getSupabaseConfig();
	if (!config) {
		console.error(
			"Supabase environment variables are missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
		);
		res.status(500).json({ error: "Server misconfiguration" });
		return null;
	}

	return createClient(config.url, config.anonKey, {
		global: { headers: { Authorization: `Bearer ${token}` } },
		auth: {
			autoRefreshToken: false,
			detectSessionInUrl: false,
			persistSession: false,
		},
	});
}

export async function requireAuthenticatedUser(
	supabase: SupabaseClient,
	res: NextApiResponse,
) {
	const { data, error } = await supabase.auth.getUser();
	if (error) {
		res.status(401).json({ error: "unauthorized" });
		return null;
	}

	if (!data.user) {
		res.status(401).json({ error: "unauthorized" });
		return null;
	}

	return data.user;
}

export async function requireAdmin(
	supabase: SupabaseClient,
	res: NextApiResponse,
) {
	const user = await requireAuthenticatedUser(supabase, res);
	if (!user) return null;
	let admin: boolean;
	try {
		admin = await isAdmin(supabase, user.id);
	} catch (error) {
		res.status(500).json({ error: getErrorMessage(error) });
		return null;
	}

	if (!admin) {
		res.status(403).json({ error: "forbidden" });
		return null;
	}

	return user;
}

export async function isAdmin(supabase: SupabaseClient, userId: string) {
	const { data, error } = await supabase
		.from("user_roles")
		.select("user_id")
		.eq("user_id", userId)
		.eq("role", "admin")
		.maybeSingle();

	if (error) throw error;
	return Boolean(data);
}

export function isRateLimited(key: string, maximumRequests: number) {
	const now = Date.now();
	rateLimits.forEach((entry, storedKey) => {
		if (now - entry.windowStartedAt >= RATE_LIMIT_WINDOW_MS) {
			rateLimits.delete(storedKey);
		}
	});
	const current = rateLimits.get(key);

	if (!current || now - current.windowStartedAt >= RATE_LIMIT_WINDOW_MS) {
		rateLimits.set(key, { count: 1, windowStartedAt: now });
		return false;
	}

	current.count += 1;
	return current.count > maximumRequests;
}

export function isPositiveIntegerArray(
	value: unknown,
	maximumLength = 100,
): value is number[] {
	return (
		Array.isArray(value) &&
		value.length <= maximumLength &&
		new Set(value).size === value.length &&
		value.every((item) => Number.isSafeInteger(item) && item > 0)
	);
}

export function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : "unknown error";
}
