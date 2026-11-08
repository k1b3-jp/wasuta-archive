import {
	readFile,
	mkdir,
	writeFile,
	rename,
	chmod,
	open,
} from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
	searchUrl,
	validatePage,
	normalizePost,
	hash,
	instant,
} from "./core.mjs";
import {
	saveAccounts,
	saveSources,
	readCoverage,
	saveCoverageFailure,
} from "./store.mjs";

export async function collectWindow({
	account,
	window,
	checkpoint,
	fetchImpl = fetch,
	savePage,
	saveFailure,
	onCheckpoint,
	maxPages = 1,
	pageSize = 100,
	maxRequests = 1,
	now = () => new Date().toISOString(),
	request,
}) {
	let pages = 0;
	// Injected request callback owns any HTTP authorization and budget; neither is persisted.
	const state = {
		run_key: checkpoint.run_key,
		received_count: checkpoint.received_count ?? 0,
		next_cursor: checkpoint.next_cursor ?? null,
		status: checkpoint.status ?? "planned",
	};
	const fail = async (status, reason) => {
		const next = { ...state, status, reason, attempted_at: now() };
		// Persist the attempt without replacing the last committed page cursor.
		await saveFailure(next);
		Object.assign(state, next);
		await onCheckpoint(state);
		return state;
	};
	if (state.status === "enumerated") return state;
	while (pages < maxPages && pages < maxRequests) {
		let response;
		try {
			response = await (request ?? ((url) => fetchImpl(url)))(
				searchUrl(account, window, state.next_cursor, pageSize),
			);
		} catch {
			return fail("failed", "network_failure");
		}
		if (!response.ok) {
			const status =
				response.status === 429
					? "partial"
					: response.status === 401 || response.status === 403
						? "access_denied"
						: "failed";
			return fail(status, `http_${response.status}`);
		}
		let body, posts;
		try {
			body = await response.json();
			posts = validatePage(body, account);
		} catch {
			return fail("partial", "invalid_or_partial_response");
		}
		if (body.meta?.next_token && body.meta.next_token === state.next_cursor) {
			return fail("partial", "repeated_cursor");
		}
		const observedAt = now();
		let normalized;
		try {
			for (const post of posts)
				if (post.created_at) {
					const date = instant(post.created_at);
					if (date < window.start || date >= window.end)
						throw Error("outside requested window");
				}
			normalized = posts.map((post) =>
				normalizePost(post, account, observedAt, { run_key: state.run_key }),
			);
		} catch {
			return fail("partial", "post_validation_failed");
		}
		const next = {
			...state,
			received_count: state.received_count + posts.length,
			next_cursor: body.meta?.next_token ?? null,
			status: body.meta?.next_token ? "partial" : "enumerated",
			attempted_at: observedAt,
		};
		// DB transaction commits records AND its cursor before filesystem checkpoint advances.
		await savePage(normalized, next);
		Object.assign(state, next);
		await onCheckpoint(state);
		pages++;
		if (!state.next_cursor) return state;
	}
	return state;
}

async function main() {
	const option = (name) => {
		const index = process.argv.indexOf(name);
		return index < 0 ? null : process.argv[index + 1];
	};
	const key = option("--account"),
		start = option("--start"),
		end = option("--end");
	const plan = JSON.parse(
		await readFile("data/research/museum/x/collection-plan.json", "utf8"),
	);
	const account = plan.accounts.find((row) => row.account_key === key);
	if (!account || !start || !end)
		throw Error(
			"Use --account <plan account_key> --start <offset timestamp> --end <offset timestamp>. Default is a request plan only.",
		);
	const window = { start: instant(start), end: instant(end) };
	if (
		window.start >= window.end ||
		window.start < plan.period_start ||
		window.end > plan.period_end
	)
		throw Error("Window must be within the fixed collection plan.");
	if (!process.argv.includes("--execute")) {
		console.log(
			JSON.stringify({
				account: key,
				window,
				network_requests: 0,
				status: "dry_run",
				requirements: [
					"X_BEARER_TOKEN in process environment",
					"explicit X_MAX_REQUESTS and X_MAX_POST_READS budgets",
					"operator has approved API cost and current retention terms",
				],
			}),
		);
		return;
	}
	const token = process.env.X_BEARER_TOKEN;
	const maxRequests = Number(process.env.X_MAX_REQUESTS),
		maxReads = Number(process.env.X_MAX_POST_READS);
	if (
		!token ||
		!Number.isSafeInteger(maxRequests) ||
		maxRequests < 2 ||
		!Number.isSafeInteger(maxReads) ||
		maxReads < 10
	)
		throw Error(
			"Execution requires environment-only credentials and explicit request/post-read limits. No request sent.",
		);
	const directory = resolve(".local/museum/x");
	await mkdir(directory, { recursive: true, mode: 0o700 });
	await chmod(directory, 0o700);
	const job = hash([key, window.start, window.end]);
	const lock = await open(`${directory}/${job}.lock`, "wx", 0o600).catch(() => {
		throw Error(
			"This window is already locked. Inspect interrupted run before removing its lock.",
		);
	});
	try {
		const runKey = `x-full:${key}:${window.start}:${window.end}`;
		const checkpoint = readCoverage(runKey) ?? { run_key: runKey };
		const path = `${directory}/${job}.json`;
		const runRecord = (state) => ({
			run_key: state.run_key,
			account_key: key,
			period_start: window.start,
			period_end: window.end,
			method: "x_api_full_archive",
			status: state.status,
			received_count: state.received_count ?? 0,
			next_cursor: state.next_cursor ?? null,
			known_total: null,
			limitations:
				"API search enumeration only; deleted, restricted, unindexed and unknown prior accounts cannot be certified complete." +
				(state.reason ? ` Last attempt: ${state.reason}` : ""),
			attempted_at: state.attempted_at,
		});
		const writeCheckpoint = async (state) => {
			await writeFile(path + ".tmp", JSON.stringify(state, null, 2) + "\n", {
				mode: 0o600,
			});
			await rename(path + ".tmp", path);
		};
		if (checkpoint.status === "enumerated") {
			console.log(
				JSON.stringify({
					account: key,
					status: "enumerated",
					received_count: checkpoint.received_count,
					requests: 0,
					full_history_complete: false,
				}),
			);
			return;
		}
		let used = 0;
		const request = async (url) => {
			if (used >= maxRequests) throw Error("request budget exhausted");
			used++;
			return fetch(url, {
				headers: { Authorization: `Bearer ${token}` },
				redirect: "error",
				signal: AbortSignal.timeout(30000),
			});
		};
		// Resolve account identity without persisting the response or any credential.
		const lookup = new URL(
			`https://api.x.com/2/users/by/username/${account.handle}`,
		);
		lookup.searchParams.set("user.fields", "id,username,created_at,protected");
		let lookupStatus = "failed";
		try {
			const response = await request(lookup);
			if (!response.ok) {
				lookupStatus =
					response.status === 401 || response.status === 403
						? "access_denied"
						: response.status === 429
							? "partial"
							: "failed";
				throw Error("Account lookup rejected");
			}
			const user = (await response.json()).data;
			if (
				!user ||
				user.protected ||
				user.username?.toLowerCase() !== account.handle.toLowerCase() ||
				typeof user.id !== "string" ||
				!/^\d+$/.test(user.id)
			)
				throw Error("Public account identity could not be confirmed");
			if (account.platform_user_id && account.platform_user_id !== user.id)
				throw Error("Handle identity changed");
			account.platform_user_id = user.id;
			saveAccounts([account]);
		} catch {
			const failure = {
				...checkpoint,
				status: lookupStatus,
				reason: "account_lookup_failed",
				attempted_at: new Date().toISOString(),
			};
			saveCoverageFailure(runRecord(failure));
			await writeCheckpoint(failure);
			throw Error(
				"Account lookup failed; attempt recorded without response content",
			);
		}
		const size = Math.min(100, maxReads);
		const result = await collectWindow({
			account,
			window,
			checkpoint,
			pageSize: size,
			maxPages: Math.floor(maxReads / size),
			maxRequests: maxRequests - used,
			request,
			saveFailure: (state) => saveCoverageFailure(runRecord(state)),
			savePage: (sources, state) => saveSources(sources, runRecord(state)),
			onCheckpoint: writeCheckpoint,
		});
		console.log(
			JSON.stringify({
				account: key,
				status: result.status,
				received_count: result.received_count,
				requests: used,
				full_history_complete: false,
			}),
		);
	} finally {
		await lock.close();
		const { unlink } = await import("node:fs/promises");
		await unlink(`${directory}/${job}.lock`);
	}
}
if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
	main().catch(() => {
		console.error(
			"X collection stopped. No credential or raw response was logged. Check configuration, local schema, identity and execution budgets.",
		);
		process.exitCode = 1;
	});
