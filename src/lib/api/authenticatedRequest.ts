import { supabase } from "@/lib/supabaseClient";

type ApiError = {
	error?: string;
};

async function authenticatedRequest<TResponse>(
	path: string,
	init?: RequestInit,
): Promise<TResponse> {
	const { data } = await supabase.auth.getSession();
	const token = data.session?.access_token;
	if (!token) throw new Error("ログインが必要です");

	const response = await fetch(path, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			...init?.headers,
		},
	});

	const responseBody = (await response.json().catch(() => ({}))) as TResponse;
	if (!response.ok) {
		const apiError = responseBody as ApiError;
		throw new Error(apiError.error || `HTTP ${response.status}`);
	}
	return responseBody;
}

export function authenticatedGet<TResponse>(path: string) {
	return authenticatedRequest<TResponse>(path);
}

export async function authenticatedPost<TResponse = void>(
	path: string,
	body: unknown,
): Promise<TResponse> {
	return authenticatedRequest<TResponse>(path, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
}
