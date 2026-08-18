import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [tag, eventPage, eventStyles] = await Promise.all([
	readFile(new URL("../src/components/ui/Tag.tsx", import.meta.url), "utf8"),
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
assert.match(tag, /selected \? "✓" : "\+"/, "tags need a visible state icon");
assert.match(
	eventPage,
	/selectedYoutubeTags\.length[^]*件選択中/,
	"video form needs a live selected-tag count",
);

console.log("Video tag state contracts OK");
