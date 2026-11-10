import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
	eventEvidenceLabel,
	visibleCards,
	safeSourceUrl,
	localEditorialPreviewAllowed,
} from "../src/lib/museum/model.ts";
const read = (name) =>
	readFileSync(`data/research/museum/${name}.jsonl`, "utf8")
		.trim()
		.split("\n")
		.map(JSON.parse);
const validDate = (value) =>
	/^\d{4}-\d{2}-\d{2}$/.test(value) &&
	!Number.isNaN(Date.parse(value)) &&
	new Date(value).toISOString().slice(0, 10) === value;
export function validateMuseum(cards, people, accounts, songs) {
	for (const records of [cards, people, accounts, songs]) {
		const ids = new Set();
		for (const row of records) {
			assert.ok(row.schema_version === "1.0");
			assert.ok(row.id && !ids.has(row.id), "duplicate ID");
			ids.add(row.id);
			assert.equal(
				row.review_status,
				"pending",
				"research must not self approve",
			);
		}
	}
	const memberIds = new Set(
		people.map((p) => p.member_id).filter((id) => id !== null),
	);
	for (const row of cards) {
		assert.equal(row.event_id, 167, "existing event only");
		assert.ok(
			row.member_id === null || memberIds.has(row.member_id),
			"missing person",
		);
		assert.ok(
			["before", "day", "after", "recollection"].includes(row.phase),
			"invalid phase",
		);
		assert.ok(
			["announcement", "performance_report", "reflection"].includes(
				row.relation_kind,
			),
		);
		assert.ok(
			["day", "instant", "unknown"].includes(row.date_precision),
			"invalid precision",
		);
		assert.ok(
			row.summary &&
				row.locator &&
				row.source.title &&
				safeSourceUrl(row.source.url),
			"missing evidence",
		);
		assert.equal(row.usage_status, "link_only");
		assert.equal(row.representation_type, "paraphrase");
		if (row.date_precision === "unknown")
			assert.ok(row.published_on === null && row.published_at === null);
		else {
			assert.ok(validDate(row.published_on));
			if (row.date_precision === "day") assert.equal(row.published_at, null);
			else
				assert.ok(
					row.published_at && !Number.isNaN(Date.parse(row.published_at)),
				);
		}
	}
	for (const song of songs) {
		assert.ok(
			cards.some((card) => card.id === song.claim_id),
			"missing evidence reference",
		);
		assert.ok(Number.isSafeInteger(song.song_id));
		assert.equal(song.event_id, 167);
	}
	return cards.length;
}
const fixture = JSON.parse(
	readFileSync("scripts/museum/fixtures/exhibit.json", "utf8"),
);
const { cards, people, accounts, songs } = fixture;
validateMuseum(cards, people, accounts, songs);
assert.equal(
	visibleCards(cards, "", "2015-04-29").length,
	0,
	"unknown original dates cannot leak into historical view",
);
assert.equal(visibleCards(cards, "", "2025-03-06").length, 0);
assert.equal(
	visibleCards(cards, "", "2025-03-07").length,
	1,
	"day precision includes the whole known day",
);
assert.equal(visibleCards(cards, "3", null).length, 2);
assert.equal(visibleCards(cards, "speaker:検証話者E", null).length, 1);
assert.equal(visibleCards(cards, "1", null).length, 0);
for (const url of [
	"javascript:alert(1)",
	"data:text/html,x",
	"https://user:pass@example.com",
	"http://example.com",
	"//example.com",
])
	assert.equal(safeSourceUrl(url), null);
assert.equal(safeSourceUrl("https://example.com/"), "https://example.com/");
const env = {
	NODE_ENV: "development",
	MUSEUM_EDITORIAL_PREVIEW: "1",
	NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
};
assert.equal(localEditorialPreviewAllowed(env, "127.0.0.1"), true);
for (const modified of [
	{ ...env, NODE_ENV: "production" },
	{ ...env, MUSEUM_EDITORIAL_PREVIEW: "0" },
	{ ...env, NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" },
])
	assert.equal(localEditorialPreviewAllowed(modified, "127.0.0.1"), false);
assert.equal(localEditorialPreviewAllowed(env, "192.168.1.2"), false);
for (const mutation of [
	(rows) => [...rows, rows[0]],
	(rows) => rows.map((r, i) => (i === 0 ? { ...r, phase: "invented" } : r)),
	(rows) =>
		rows.map((r, i) => (i === 0 ? { ...r, review_status: "approved" } : r)),
	(rows) => rows.map((r, i) => (i === 0 ? { ...r, member_id: 999 } : r)),
	(rows) => rows.map((r, i) => (i === 0 ? { ...r, locator: "" } : r)),
	(rows) =>
		rows.map((r, i) => (i === 0 ? { ...r, published_on: "2015-04-29" } : r)),
])
	assert.throws(() => validateMuseum(mutation(cards), people, accounts, songs));
assert.throws(() =>
	validateMuseum(cards, people, accounts, [
		{ ...songs[0], claim_id: "missing" },
	]),
);
console.log(
	`Museum: ${cards.length} fictional passages, ${accounts.length} fictional accounts; chronology, evidence, privacy and contract boundaries passed.`,
);

assert.match(eventEvidenceLabel("2027-01-01", cards, false), /予定/);
assert.match(
	eventEvidenceLabel(
		"2015-04-29",
		cards.filter((c) => c.relation_kind === "announcement"),
		false,
	),
	/実施確認資料は未収録/,
);
assert.match(eventEvidenceLabel("2015-04-29", cards, true), /承認待ち/);
