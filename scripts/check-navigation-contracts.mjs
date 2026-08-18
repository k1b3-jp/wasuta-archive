import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const navBar = await readFile(
	new URL("../src/components/navigation/NavBar.tsx", import.meta.url),
	"utf8",
);

assert.match(navBar, /\bisAdmin\b/, "navigation must use the administrator role");
assert.match(
	navBar,
	/href="\/events\/create"/,
	"administrators need an event creation link",
);
assert.match(
	navBar,
	/href="\/archive\/manage"/,
	"administrators need an archive management link",
);

console.log("Navigation contracts OK: administrator editing links are present");
