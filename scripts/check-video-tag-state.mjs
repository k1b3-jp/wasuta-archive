import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [eventPage, eventStyles] = await Promise.all([
	readFile(new URL("../src/pages/events/[id].tsx", import.meta.url), "utf8"),
	readFile(
		new URL("../src/pages/events/eventDetail.module.scss", import.meta.url),
		"utf8",
	),
]);

assert.doesNotMatch(
	eventStyles,
	/\.admin\s+button\s*\{/,
	"admin button styles must not override selectable tag buttons",
);
assert.match(
	eventPage,
	/className=\{styles\.submitButton\}/,
	"submit styling must be scoped to the submit button",
);
assert.match(
	eventPage,
	/className=\{styles\.videoTag\}/,
	"video attributes need dedicated tag styling",
);
assert.match(
	eventPage,
	/aria-pressed=\{selectedYoutubeTags\.some/,
	"video attributes must expose their selected state",
);
assert.match(
	eventPage,
	/\? "✓"[^]*: "\+"/,
	"video attributes need a visible state icon",
);
assert.match(
	eventPage,
	/selectedYoutubeTags\.length[^]*件選択中/,
	"video form needs a live selected-tag count",
);

console.log("Video tag state contracts OK");
