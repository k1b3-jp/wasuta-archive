import test from "node:test";
import assert from "node:assert/strict";
import {
	normalizePost,
	normalizeExistingCard,
	monthWindows,
	searchUrl,
	validatePage,
	instant,
} from "./core.mjs";
import { collectWindow } from "./collect-x.mjs";
const account = {
	account_key: "fixture-account",
	handle: "fixture_user",
	platform_user_id: "9007199254740993123",
};
const window = {
	start: "2020-01-01T00:00:00.000Z",
	end: "2020-02-01T00:00:00.000Z",
};
const observed = "2026-11-08T01:00:00Z";
const post = {
	id: "9007199254740993222",
	author_id: account.platform_user_id,
	created_at: "2020-01-02T03:04:05Z",
	text: "Fictional test post",
	referenced_posts: [{ type: "quoted", id: "9007199254740993111" }],
};
const page = { data: [post], meta: { result_count: 1 } };
const response = (value) =>
	new Response(JSON.stringify(value), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
async function run(options = {}) {
	const saved = [],
		checkpoints = [],
		failures = [];
	let calls = 0;
	const state = await collectWindow({
		account,
		window,
		checkpoint: { run_key: "fixture-run" },
		now: () => observed,
		request: async () => {
			calls++;
			return response(page);
		},
		savePage: async (sources, state) => saved.push({ sources, state }),
		saveFailure: async (state) => failures.push({ ...state }),
		onCheckpoint: async (state) => checkpoints.push({ ...state }),
		...options,
	});
	return { state, saved, checkpoints, failures, calls };
}
test("normalization preserves large post IDs and original timestamps", () => {
	const source = normalizePost(post, account, observed);
	assert.equal(source.record.platform_post_id, post.id);
	assert.equal(source.version.published_at, "2020-01-02T03:04:05.000Z");
	assert.equal(source.version.public_metadata.references[0].type, "quoted");
});
test("repeated content reuses version; observations stay independent", () => {
	const a = normalizePost(post, account, observed),
		b = normalizePost(post, account, "2026-11-08T02:00:00Z");
	assert.equal(a.version.version_key, b.version.version_key);
	assert.notEqual(a.observation.observation_key, b.observation.observation_key);
});
test("metric updates do not manufacture a new content revision", () => {
	const a = normalizePost(post, account, observed),
		b = normalizePost(
			{ ...post, public_metrics: { like_count: 10 } },
			account,
			observed,
		);
	assert.equal(a.version.version_key, b.version.version_key);
	assert.equal(b.observation.metrics.like_count, 10);
});
test("changed text produces a new source revision", () =>
	assert.notEqual(
		normalizePost(post, account, observed).version.version_key,
		normalizePost({ ...post, text: "Correction" }, account, observed).version
			.version_key,
	));
test("long-form content is retained and arbitrary secrets are excluded", () => {
	const source = normalizePost(
		{
			...post,
			note_post: { text: "Full fictional long text" },
			authorization: "SECRET",
			confirmed_email: "private@example.com",
		},
		account,
		observed,
	);
	assert.equal(source.version.text_content, "Full fictional long text");
	assert.ok(!JSON.stringify(source).includes("SECRET"));
	assert.ok(!JSON.stringify(source).includes("private@example.com"));
});
test("legacy API field names retain references and long content", () => {
	const source = normalizePost(
		{
			...post,
			referenced_posts: undefined,
			referenced_tweets: [{ type: "retweeted", id: "123" }],
			note_tweet: { text: "Long legacy text" },
		},
		account,
		observed,
	);
	assert.equal(source.version.public_metadata.references[0].type, "retweeted");
	assert.equal(source.version.text_content, "Long legacy text");
});
test("unknown publication time stays unknown", () => {
	const source = normalizePost(
		{ ...post, created_at: undefined },
		account,
		observed,
	);
	assert.equal(source.version.published_at, null);
	assert.equal(source.version.date_precision, "unknown");
});
test("author mismatch and numeric post IDs are rejected", () => {
	assert.throws(() =>
		normalizePost({ ...post, author_id: "999" }, account, observed),
	);
	assert.throws(() => normalizePost({ ...post, id: 123 }, account, observed));
});
test("prior editorial summary is not treated as original source text", () => {
	const source = normalizeExistingCard(
		{
			id: "fixture-card",
			event_id: 167,
			member_id: null,
			speaker: "Fictional test speaker",
			source: {
				url: "https://example.com/fixture",
				title: "Fixture",
				publisher: "Fixture",
			},
			locator: "Paragraph 2",
			summary: "Edited proposal",
			published_on: null,
			published_at: null,
			original_publication_confirmed: false,
			original_date_label: null,
		},
		observed,
	);
	assert.equal(source.version.text_content, null);
	assert.equal(source.version.content_status, "metadata_only");
	assert.equal(source.proposal.summary, "Edited proposal");
	assert.ok(!("phase" in source.record));
});
test("new source revisions retain independent passages and editorial proposals", () => {
	const card = {
		id: "fixture-revision",
		event_id: 167,
		member_id: null,
		speaker: "Fixture",
		source: {
			url: "https://example.com/revision",
			title: "Fixture",
			publisher: "Fixture",
		},
		locator: "Paragraph 1",
		summary: "Initial editorial proposal",
		published_on: null,
		published_at: null,
		original_publication_confirmed: false,
		original_date_label: null,
	};
	const first = normalizeExistingCard(card, observed);
	const revised = normalizeExistingCard(
		{
			...card,
			published_on: "2015-04-01",
			original_publication_confirmed: true,
		},
		observed,
	);
	assert.equal(first.record.record_key, revised.record.record_key);
	assert.notEqual(first.version.version_key, revised.version.version_key);
	assert.notEqual(first.passage.passage_key, revised.passage.passage_key);
	assert.notEqual(first.proposal.proposal_key, revised.proposal.proposal_key);
	assert.equal(first.passage.version_key, first.version.version_key);
	assert.equal(revised.passage.version_key, revised.version.version_key);
	assert.equal(revised.proposal.passage_key, revised.passage.passage_key);
	const wordingOnly = normalizeExistingCard(
		{ ...card, summary: "Revised editorial proposal" },
		observed,
	);
	assert.equal(wordingOnly.version.version_key, first.version.version_key);
	assert.equal(wordingOnly.passage.passage_key, first.passage.passage_key);
	assert.notEqual(
		wordingOnly.proposal.proposal_key,
		first.proposal.proposal_key,
	);
	assert.equal(
		normalizeExistingCard(card, observed).proposal.proposal_key,
		first.proposal.proposal_key,
	);
});
test("monthly windows are adjacent with no gaps or artificial event dates", () => {
	const windows = monthWindows("2020-01-15T00:00:00Z", "2020-03-03T00:00:00Z");
	assert.equal(windows.length, 3);
	assert.equal(windows[0].end, windows[1].start);
	assert.equal(windows[1].end, windows[2].start);
	assert.throws(() => monthWindows("2020-01-01", "2020-02-01"));
});
test("API query includes all post kinds and targets full archive", () => {
	const url = searchUrl(account, window, "NEXT");
	assert.equal(url.pathname, "/2/tweets/search/all");
	assert.equal(url.searchParams.get("query"), "from:fixture_user");
	assert.equal(url.searchParams.get("next_token"), "NEXT");
	assert.ok(!url.search.includes("-is:"));
	assert.ok(url.searchParams.has("post.fields"));
	assert.equal(url.searchParams.get("expansions"), "author_id");
});
test("no lookup by handle is accepted as immutable identity", () => {
	assert.throws(() =>
		searchUrl({ ...account, platform_user_id: null }, window),
	);
	assert.throws(() => searchUrl({ ...account, handle: "bad query" }, window));
});
test("partial errors, protected accounts and empty malformed pages are rejected", () => {
	assert.throws(() => validatePage({ ...page, errors: [{}] }, account));
	assert.throws(() =>
		validatePage(
			{
				...page,
				includes: {
					users: [{ id: account.platform_user_id, protected: true }],
				},
			},
			account,
		),
	);
	assert.throws(() => validatePage({}, account));
	assert.equal(validatePage({ meta: { result_count: 0 } }, account).length, 0);
});
test("successful final page commits before marking enumeration", async () => {
	const result = await run();
	assert.equal(result.saved.length, 1);
	assert.equal(result.state.status, "enumerated");
	assert.equal(result.state.received_count, 1);
});
test("request budget leaves a resumable partial cursor", async () => {
	const result = await run({
		request: async () =>
			response({ ...page, meta: { result_count: 1, next_token: "NEXT" } }),
		maxPages: 10,
		maxRequests: 1,
	});
	assert.equal(result.saved.length, 1);
	assert.equal(result.state.status, "partial");
	assert.equal(result.state.next_cursor, "NEXT");
});
test("429 keeps old cursor and does not save an error as a post", async () => {
	const result = await run({
		checkpoint: {
			run_key: "fixture-run",
			next_cursor: "OLD",
			received_count: 7,
		},
		request: async () => new Response("do not persist", { status: 429 }),
	});
	assert.equal(result.saved.length, 0);
	assert.equal(result.state.next_cursor, "OLD");
	assert.equal(result.state.received_count, 7);
	assert.equal(result.state.status, "partial");
	assert.equal(result.failures[0].status, "partial");
	assert.equal(result.failures[0].attempted_at, observed);
	assert.equal(result.failures[0].next_cursor, "OLD");
});
test("partial response never advances cursor", async () => {
	const result = await run({
		request: async () =>
			response({ ...page, errors: [{ detail: "private error" }] }),
	});
	assert.equal(result.saved.length, 0);
	assert.equal(result.state.status, "partial");
	assert.ok(!JSON.stringify(result.checkpoints).includes("private error"));
	assert.equal(result.failures[0].reason, "invalid_or_partial_response");
});
test("access denial is persisted with attempt time and previous cursor before file checkpoint", async () => {
	const order = [];
	const result = await run({
		checkpoint: {
			run_key: "fixture-run",
			next_cursor: "OLD",
			received_count: 7,
		},
		request: async () => new Response("private error body", { status: 403 }),
		saveFailure: async (state) => {
			order.push("database");
			assert.equal(state.status, "access_denied");
			assert.equal(state.attempted_at, observed);
			assert.equal(state.next_cursor, "OLD");
			assert.equal(state.received_count, 7);
		},
		onCheckpoint: async () => order.push("file"),
	});
	assert.equal(result.state.status, "access_denied");
	assert.deepEqual(order, ["database", "file"]);
});
test("network failure is recorded without exception text or cursor loss", async () => {
	const result = await run({
		request: async () => {
			throw Error("secret network details");
		},
		checkpoint: {
			run_key: "fixture-run",
			next_cursor: "OLD",
			received_count: 7,
		},
	});
	assert.equal(result.failures[0].status, "failed");
	assert.equal(result.failures[0].reason, "network_failure");
	assert.equal(result.failures[0].next_cursor, "OLD");
	assert.ok(
		!JSON.stringify(result.failures).includes("secret network details"),
	);
});
test("failure-state DB write failure does not advance filesystem checkpoint", async () => {
	let written = false;
	await assert.rejects(() =>
		run({
			request: async () => new Response("", { status: 429 }),
			saveFailure: async () => {
				throw Error("fixture failure");
			},
			onCheckpoint: async () => {
				written = true;
			},
		}),
	);
	assert.equal(written, false);
});
test("repeated cursor stops without looping or duplicate save", async () => {
	const result = await run({
		checkpoint: { run_key: "fixture-run", next_cursor: "SAME" },
		request: async () => response({ ...page, meta: { next_token: "SAME" } }),
	});
	assert.equal(result.saved.length, 0);
	assert.equal(result.state.status, "partial");
});
test("failed DB save cannot advance checkpoint", async () => {
	let checkpoint = false;
	await assert.rejects(() =>
		run({
			savePage: async () => {
				throw Error("fixture failure");
			},
			onCheckpoint: async () => {
				checkpoint = true;
			},
		}),
	);
	assert.equal(checkpoint, false);
});
test("already enumerated windows do not request again", async () => {
	const result = await run({
		checkpoint: { run_key: "fixture-run", status: "enumerated" },
	});
	assert.equal(result.calls, 0);
});
test("out of period posts stop without assigning a different date", async () => {
	const result = await run({
		request: async () =>
			response({ data: [{ ...post, created_at: "2019-01-01T00:00:00Z" }] }),
	});
	assert.equal(result.saved.length, 0);
	assert.equal(result.state.status, "partial");
});
test("offset-less timestamps are never interpreted in host timezone", () =>
	assert.throws(() => instant("2020-01-01T01:00:00")));
test("nonexistent calendar dates and rollover times are rejected rather than repaired", () => {
	for (const value of [
		"2020-02-30T01:00:00Z",
		"2021-02-29T01:00:00Z",
		"1900-02-29T01:00:00Z",
		"2020-04-31T01:00:00+09:00",
		"2020-00-01T01:00:00Z",
		"2020-13-01T01:00:00Z",
		"2020-01-00T01:00:00Z",
		"2020-01-01T24:00:00Z",
		"2020-01-01T23:60:00Z",
		"2020-01-01T23:59:60Z",
		"2020-01-01T01:00:00+24:00",
		"2020-01-01T01:00:00+09:60",
	])
		assert.throws(() => instant(value), value);
});
test("valid leap dates and explicit offsets retain their actual instant", () => {
	assert.equal(
		instant("2000-02-29T23:30:15.123+09:00"),
		"2000-02-29T14:30:15.123Z",
	);
	assert.equal(
		instant("2020-02-29T23:30:15-02:00"),
		"2020-03-01T01:30:15.000Z",
	);
	assert.equal(instant("2020-02-29T00:00:00Z"), "2020-02-29T00:00:00.000Z");
});
