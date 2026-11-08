import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hash, makeSource, httpsUrl, instant } from "./core.mjs";
import { saveSources } from "./store.mjs";

// Import only deliberately captured visible post summaries; no cookies, HTML scripts or requests.
export function normalizeBrowserObservation(row, account) {
	if (
		row.schema_version !== "2.0" ||
		row.method !== "x_browser_visible" ||
		row.visibility !== "public"
	)
		throw Error("A public visible-page observation is required");
	const url = new URL(httpsUrl(row.source_url));
	const match = url.pathname.match(/^\/([A-Za-z0-9_]{1,15})\/status\/(\d+)$/);
	if (
		!["x.com", "www.x.com", "twitter.com", "www.twitter.com"].includes(
			url.hostname,
		) ||
		!match ||
		match[1].toLowerCase() !== account.handle.toLowerCase()
	)
		throw Error("Observed post URL must belong to the selected account");
	if (
		row.account_key !== account.account_key ||
		row.post_id !== match[2] ||
		typeof row.visible_text !== "string" ||
		!row.visible_text.trim()
	)
		throw Error("Post identity or observed text is missing");
	instant(row.captured_at);
	const date = row.displayed_date?.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
	const day = date
		? `${date[1]}-${date[2].padStart(2, "0")}-${date[3].padStart(2, "0")}`
		: null;
	if (day && new Date(day).toISOString().slice(0, 10) !== day)
		throw Error("Invalid displayed calendar date");
	const source = makeSource({
		recordKey: "x:" + row.post_id,
		platform: "X",
		postId: row.post_id,
		accountKey: account.account_key,
		url: url.href,
		text: row.visible_text,
		publishedOn: day,
		confirmed: false,
		dateLabel: row.displayed_date ?? null,
		observedAt: row.captured_at,
		contentStatus: "partial",
		method: "x_browser_visible",
		metadata: {
			representation: "accessibility_post_summary",
			text_completeness: "visible_only",
			source_url: url.href,
			query_url: row.query_url ? httpsUrl(row.query_url) : null,
			author_handle: match[1],
			immutable_author_id_confirmed: false,
			display_timezone: "unconfirmed",
			includes_images_or_video: false,
		},
	});
	source.passage = {
		passage_key:
			"passage:" + hash([source.version.version_key, "visible-post-summary"]),
		version_key: source.version.version_key,
		locator:
			"Post permalink; visible accessibility summary. Includes interface labels; original line breaks, media and hidden text are not captured.",
	};
	return source;
}
async function main() {
	const path = process.argv[2];
	if (!path)
		throw Error(
			"Provide a local JSON array of explicitly captured public post observations",
		);
	const rows = JSON.parse(await readFile(path, "utf8"));
	if (!Array.isArray(rows)) throw Error("Observation array required");
	const plan = JSON.parse(
		await readFile("data/research/museum/x/collection-plan.json", "utf8"),
	);
	const normalized = rows.map((row) => {
		const account = plan.accounts.find(
			(item) => item.account_key === row.account_key,
		);
		if (!account) throw Error("Unknown account");
		return normalizeBrowserObservation(row, account);
	});
	if (process.argv.includes("--apply-local")) saveSources(normalized);
	console.log(
		`Browser observations validated: ${normalized.length}. ${process.argv.includes("--apply-local") ? "Stored privately in local DB; no publication." : "Validation only."} These are partial visible snapshots, not full original post objects.`,
	);
}
if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
	main().catch(() => {
		console.error(
			"Browser import stopped; no raw observation or credentials logged.",
		);
		process.exitCode = 1;
	});
