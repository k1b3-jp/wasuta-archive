import assert from "node:assert/strict";
import {
	buildGeneratedOgImageUrl,
	getDefaultOgImageUrl,
	getSiteUrl,
	toAbsoluteUrl,
} from "../src/lib/ogImage.ts";

delete process.env.NEXT_PUBLIC_SITE_URL;
delete process.env.defaultOgpImage;

assert.equal(getSiteUrl(), "https://www.wasuta-archive.com");
assert.equal(
	getDefaultOgImageUrl(),
	"https://www.wasuta-archive.com/opengraph-image.png",
);
assert.equal(
	toAbsoluteUrl("/event-placeholder.png"),
	"https://www.wasuta-archive.com/event-placeholder.png",
);
assert.equal(toAbsoluteUrl("not a url"), null);

const generated = new URL(
	buildGeneratedOgImageUrl({
		title: "ガラフェス ～渋谷 文化的衝撃センセーション 秋の新作発表会～",
		image: "/event-placeholder.png",
	}),
);
assert.equal(
	`${generated.origin}${generated.pathname}`,
	"https://www.wasuta-archive.com/api/og",
);
assert.equal(
	generated.searchParams.get("title"),
	"ガラフェス ～渋谷 文化的衝撃センセーション 秋の新作発表会～",
);
assert.equal(
	generated.searchParams.get("image"),
	"https://www.wasuta-archive.com/event-placeholder.png",
);
assert.equal(generated.search.includes(" "), false);

const remoteImage = new URL(
	buildGeneratedOgImageUrl({
		title: "title",
		image: "https://example.com/a.png?x=1&y=2",
	}),
);
assert.equal(
	remoteImage.searchParams.get("image"),
	"https://example.com/a.png?x=1&y=2",
);

console.log("OG image URL contracts OK");
