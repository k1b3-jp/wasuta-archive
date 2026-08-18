import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const manifest = JSON.parse(
	await readFile(
		new URL("../public/manifest.webmanifest", import.meta.url),
		"utf8",
	),
);
const serviceWorker = await readFile(
	new URL("../public/sw.js", import.meta.url),
	"utf8",
);
const app = await readFile(
	new URL("../src/pages/_app.tsx", import.meta.url),
	"utf8",
);

assert.equal(manifest.display, "standalone");
assert.equal(manifest.start_url, "/?source=pwa");
assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));
assert.match(serviceWorker, /request\.mode === "navigate"/);
assert.match(serviceWorker, /url\.pathname\.startsWith\("\/api\/"\)/);
assert.match(app, /rel="manifest" href="\/manifest\.webmanifest"/);
assert.match(app, /apple-touch-icon/);

await Promise.all(
	manifest.icons.map((icon) =>
		access(new URL(`../public${icon.src}`, import.meta.url)),
	),
);
await access(new URL("../public/icons/apple-touch-icon.png", import.meta.url));

console.log("PWA contracts OK");
