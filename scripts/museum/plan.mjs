import { readFile, mkdir, writeFile } from "node:fs/promises";
import { monthWindows } from "./core.mjs";
import {
	saveAccounts,
	saveCoverage,
	saveSources,
	saveEvidence,
} from "./store.mjs";
import { normalizeExistingCard, makeSource, hash } from "./core.mjs";
const now = new Date().toISOString();
const rows = (await readFile("data/research/museum/accounts.jsonl", "utf8"))
	.trim()
	.split("\n")
	.map(JSON.parse);
const people = (await readFile("data/research/museum/people.jsonl", "utf8"))
	.trim()
	.split("\n")
	.map(JSON.parse);
const accounts = rows
	.filter((row) => row.platform === "X" && row.owner !== "わーすた公式")
	.map((row) => ({
		account_key: row.id,
		platform: "X",
		platform_user_id: row.platform_user_id,
		member_id:
			people.find((person) => person.name === row.owner)?.member_id ?? null,
		owner_label: row.owner,
		official_status: row.official_status,
		evidence_url: row.official_evidence_url,
		evidence_locator: row.official_evidence_locator,
		handle: row.handle_history.at(-1)?.handle,
		url: row.url,
		observed_at: now,
	}));
const start = "2006-03-21T00:00:00.000Z";
let existingPlan;
try {
	existingPlan = JSON.parse(
		await readFile("data/research/museum/x/collection-plan.json", "utf8"),
	);
} catch (error) {
	if (error.code !== "ENOENT") throw error;
}
const end =
	existingPlan?.period_end ??
	new Date(
		Math.min(Date.parse(now), Date.parse("2026-11-08T15:00:00Z")),
	).toISOString();
const windows = monthWindows(start, end);
const runs = accounts.flatMap((account) =>
	windows.map((window) => ({
		run_key: `x-full:${account.account_key}:${window.start}:${window.end}`,
		account_key: account.account_key,
		period_start: window.start,
		period_end: window.end,
		method: "x_api_full_archive",
		status: "blocked_auth",
		received_count: 0,
		next_cursor: null,
		known_total: null,
		limitations:
			"Credentials and spending authorization absent. Resolve immutable ID and account creation first. Replies, quotes and reposts are not excluded. Enumeration is not proof of all historical posts.",
		attempted_at: null,
	})),
);
const plan = {
	schema_version: "2.0",
	generated_at: now,
	scope:
		"all public posts of five historical members; no likes, DMs or protected content",
	period_start: start,
	period_end: end,
	accounts,
	run_count: runs.length,
	known_total: null,
	status: "blocked_auth",
	method: "full_archive_monthly",
	scope_notes: [
		"Resolve actual account creation and immutable user IDs before live runs. Pre-creation months can then be marked out of scope with evidence.",
		"Old or renamed accounts remain unresolved. Never equate current handle coverage with all lifetime accounts.",
		"No paid HTTP requests have been made.",
	],
};
await mkdir("data/research/museum/x", { recursive: true });
await writeFile(
	"data/research/museum/x/collection-plan.json",
	JSON.stringify(plan, null, 2) + "\n",
);
if (process.argv.includes("--apply-local")) {
	saveAccounts(accounts);
	saveCoverage(runs);
	const cards = (await readFile("data/research/museum/cards.jsonl", "utf8"))
		.trim()
		.split("\n")
		.map(JSON.parse);
	saveSources(cards.map((card) => normalizeExistingCard(card, now)));
	const evidenceSources = [],
		evidence = [];
	for (const account of accounts) {
		const prior = cards.find(
			(card) => card.source.url === account.evidence_url,
		);
		const base = prior
			? normalizeExistingCard(prior, now)
			: makeSource({
					recordKey: "web:" + hash(account.evidence_url),
					platform: "Web",
					url: account.evidence_url,
					title: `公式プロフィール：${account.owner_label}`,
					observedAt: now,
					method: "official_account_link_review",
					metadata: {
						publisher: "わーすた公式サイト",
						title_kind: "catalog_label",
						body_storage: "not_collected",
					},
				});
		const passage = {
			passage_key:
				"passage:" + hash([base.version.version_key, account.evidence_locator]),
			version_key: base.version.version_key,
			locator: account.evidence_locator,
		};
		evidenceSources.push({
			record: base.record,
			version: base.version,
			observation: base.observation,
			passage,
		});
		evidence.push({
			account_key: account.account_key,
			passage_key: passage.passage_key,
			fact_kind: "official_identity",
		});
	}
	saveEvidence(evidenceSources, evidence);
}
console.log(
	`Prepared ${accounts.length} X accounts and ${runs.length} monthly windows. X posts collected: 0. ${process.argv.includes("--apply-local") ? "Local research account/coverage rows and six existing primary-source records plus four official profile records stored; nothing published." : "Plan only; no DB writes."}`,
);
