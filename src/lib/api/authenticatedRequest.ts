import { supabase } from "@/lib/supabaseClient";

type ApiError = {
	error?: string;
};

export async function authenticatedPost<TResponse = void>(
	path: string,
	body: unknown,
): Promise<TResponse> {
	const { data } = await supabase.auth.getSession();
	const token = data.session?.access_token;
	if (!token) throw new Error("ログインが必要です");

	const response = await fetch(path, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	const responseBody = (await response.json().catch(() => ({}))) as TResponse;
	if (!response.ok) {
		const apiError = responseBody as ApiError;
		const message =
			apiError && typeof apiError === "object" && apiError.error
				? apiError.error
				: `HTTP ${response.status}`;
		throw new Error(message);
	}

	return responseBody as TResponse;
}
