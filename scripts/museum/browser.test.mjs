import test from "node:test";
import assert from "node:assert/strict";
import { normalizeBrowserObservation } from "./import-browser.mjs";
const account = { account_key: "fixture-account", handle: "fixture_user" };
const row = {
	schema_version: "2.0",
	method: "x_browser_visible",
	visibility: "public",
	account_key: account.account_key,
	post_id: "9007199254740993222",
	source_url: "https://x.com/fixture_user/status/9007199254740993222",
	displayed_date: "2015年5月1日",
	visible_text: "Fictional visible post summary including interface labels",
	captured_at: "2026-11-08T03:15:38Z",
	query_url: "https://x.com/search?q=from%3Afixture_user",
};
test("visible browser data stays partial and day precision without guessing author ID", () => {
	const source = normalizeBrowserObservation(row, account);
	assert.equal(source.version.content_status, "partial");
	assert.equal(source.version.published_at, null);
	assert.equal(source.version.published_on, "2015-05-01");
	assert.equal(source.version.original_publication_confirmed, false);
	assert.equal(
		source.version.public_metadata.immutable_author_id_confirmed,
		false,
	);
	assert.equal(source.observation.method, "x_browser_visible");
});
test("API and browser use the same stable post identity", () =>
	assert.equal(
		normalizeBrowserObservation(row, account).record.record_key,
		"x:" + row.post_id,
	));
test("wrong author, non-X host and private content are rejected", () => {
	for (const patch of [
		{ source_url: row.source_url.replace("fixture_user", "other_user") },
		{ source_url: row.source_url.replace("x.com", "example.com") },
		{ visibility: "protected" },
		{ account_key: "wrong" },
		{ post_id: "123" },
	])
		assert.throws(() =>
			normalizeBrowserObservation({ ...row, ...patch }, account),
		);
});
test("cookies and arbitrary fields cannot enter storage", () =>
	assert.ok(
		!JSON.stringify(
			normalizeBrowserObservation(
				{ ...row, cookie: "DO_NOT_STORE", authorization: "DO_NOT_STORE" },
				account,
			),
		).includes("DO_NOT_STORE"),
	));
test("missing displayed dates are never inferred from post ID", () => {
	const source = normalizeBrowserObservation(
		{ ...row, displayed_date: null },
		account,
	);
	assert.equal(source.version.date_precision, "unknown");
	assert.equal(source.version.published_on, null);
});
test("invalid visible calendar dates are rejected", () =>
	assert.throws(() =>
		normalizeBrowserObservation(
			{ ...row, displayed_date: "2015年2月30日" },
			account,
		),
	));
