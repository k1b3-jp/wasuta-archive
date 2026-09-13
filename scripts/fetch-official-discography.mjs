import { mkdir, writeFile } from "node:fs/promises";

const base = "https://wa-suta.world";
const output = "data/research/official-discography.json";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const decode = (value) =>
	value
		.replace(/<[^>]+>/g, "")
		.replaceAll("&nbsp;", " ")
		.replaceAll("&amp;", "&")
		.replaceAll("&quot;", '"')
		.replaceAll("&#039;", "'")
		.trim();

async function get(path) {
	const response = await fetch(`${base}${path}`, {
		headers: { "user-agent": "wasuta-archive research contact: repository maintainer" },
	});
	if (!response.ok) throw new Error(`${response.status} ${path}`);
	return response.text();
}

const detailPaths = new Set();
for (let page = 1; ; page += 1) {
	const html = await get(`/discography/?page=${page}&c=`);
	const paths = [...html.matchAll(/href="(\/discography\/detail\.php\?id=\d+)"/g)].map(
		(match) => match[1],
	);
	if (paths.length === 0) break;
	for (const path of paths) detailPaths.add(path);
	await wait(500);
}

const releases = [];
for (const path of detailPaths) {
	const html = await get(path);
	const title = decode(html.match(/<h1 class="disc__title wovn-ignore">([\s\S]*?)<\/h1>/)?.[1] ?? "");
	const dates = [...html.matchAll(/<li class="package__meta">(\d{4}\.\d{2}\.\d{2})<\/li>/g)].map(
		(match) => match[1].replaceAll(".", "-"),
	);
	const releaseDate = dates.sort()[0] ?? null;
	const tracks = [];
	for (const disc of html.matchAll(/<div class="package__disc">([\s\S]*?)<\/div>/g)) {
		const medium = decode(disc[1].match(/<h3 class="package__cell wovn-ignore">([\s\S]*?)<\/h3>/)?.[1] ?? "");
		if (!/^(CD|配信限定|ミュージックカード)$/.test(medium)) continue;
		for (const row of disc[1].matchAll(/<li class="package__music wovn-ignore">([\s\S]*?)<\/li>/g)) {
			const track = decode(row[1]).replace(/^\d{1,2}\.\s*/, "");
			if (!track || /(?:instrumental|karaoke)/i.test(track) || /^Message from\s/i.test(track)) continue;
			tracks.push(track);
		}
	}
	releases.push({
		title,
		releaseDate,
		sourceUrl: `${base}${path}`,
		tracks: [...new Set(tracks)],
	});
	await wait(500);
}

const songMap = new Map();
for (const release of releases) {
	for (const title of release.tracks) {
		const key = title.normalize("NFKC").toLocaleLowerCase("ja");
		const current = songMap.get(key) ?? { title, releaseDate: release.releaseDate, sources: [] };
		if (release.releaseDate && (!current.releaseDate || release.releaseDate < current.releaseDate))
			current.releaseDate = release.releaseDate;
		current.sources.push({ release: release.title, url: release.sourceUrl });
		songMap.set(key, current);
	}
}

const artifact = {
	source: "わーすた オフィシャルウェブサイト DISCOGRAPHY",
	retrievedAt: new Date().toISOString(),
	releases: releases.sort((a, b) => (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "")),
	songs: [...songMap.values()].sort((a, b) => a.title.localeCompare(b.title, "ja")),
};
await mkdir("data/research", { recursive: true });
await writeFile(output, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ output, releases: artifact.releases.length, songs: artifact.songs.length }));
