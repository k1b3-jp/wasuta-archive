import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const iconDirectory = new URL("../public/icons/", import.meta.url);
const logoPath = new URL("../public/logo.svg", import.meta.url);

await mkdir(iconDirectory, { recursive: true });

async function createIcon(
	filename,
	size,
	background,
	foreground,
	paddingRatio,
) {
	const logoSize = Math.round(size * (1 - paddingRatio * 2));
	const svg = (await readFile(logoPath, "utf8")).replaceAll(
		"currentColor",
		foreground,
	);
	const logo = await sharp(Buffer.from(svg))
		.resize(logoSize, logoSize)
		.png()
		.toBuffer();

	await sharp({
		create: { width: size, height: size, channels: 4, background },
	})
		.composite([{ input: logo, gravity: "center" }])
		.png()
		.toFile(fileURLToPath(new URL(filename, iconDirectory)));
}

await Promise.all([
	createIcon("icon-192.png", 192, "#fffdfa", "#29262d", 0.14),
	createIcon("icon-512.png", 512, "#fffdfa", "#29262d", 0.14),
	createIcon("icon-maskable-192.png", 192, "#9e5381", "#ffffff", 0.24),
	createIcon("icon-maskable-512.png", 512, "#9e5381", "#ffffff", 0.24),
	createIcon("apple-touch-icon.png", 180, "#fffdfa", "#29262d", 0.14),
]);

console.log("PWA icons generated");
