import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
const buildId = readFileSync(".next/BUILD_ID", "utf8").trim();
const origin = "http://127.0.0.1:3001";
for (const path of [
	"/archive/exhibit-preview/167",
	`/_next/data/${buildId}/archive/exhibit-preview/167.json`,
]) {
	const response = await fetch(origin + path),
		body = await response.text();
	assert.equal(response.status, 404);
	assert.ok(!body.includes("松田は自己紹介記事"));
}
for (const path of [
	"/events/167/exhibit",
	`/_next/data/${buildId}/events/167/exhibit.json`,
]) {
	const response = await fetch(origin + path),
		body = await response.text();
	assert.equal(response.status, 200);
	assert.ok(!body.includes("hazuki-year-end"));
	assert.ok(!body.includes("松田は自己紹介記事"));
}
const trace = JSON.parse(
	readFileSync(
		".next/server/pages/archive/exhibit-preview/[id].js.nft.json",
		"utf8",
	),
);
assert.ok(!trace.files.some((path) => path.includes("data/research/museum")));
const research = existsSync("data/research/museum/cards.jsonl")
	? readFileSync("data/research/museum/cards.jsonl", "utf8")
			.trim()
			.split("\n")
			.map(JSON.parse)
	: JSON.parse(readFileSync("scripts/museum/fixtures/exhibit.json", "utf8"))
			.cards;
function scan(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = dir + "/" + entry.name;
		if (entry.isDirectory()) scan(path);
		else if (/\.(js|json|html|map)$/.test(entry.name)) {
			const body = readFileSync(path, "utf8");
			for (const card of research)
				assert.ok(
					!body.includes(card.summary),
					`unapproved summary in ${path}`,
				);
		}
	}
}
scan(".next/static");
scan(".next/server");
console.log(
	"Museum production boundaries passed: preview HTML/data 404, public HTML/data excludes research, trace and bundles exclude all six unapproved summaries.",
);
