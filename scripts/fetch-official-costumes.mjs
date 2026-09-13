import { mkdir, writeFile } from "node:fs/promises";

const base = "https://tws-tws.com";
const output = "data/research/official-costumes.json";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const decode = (value) =>
	value
		.replace(/<[^>]+>/g, "")
		.replaceAll("&nbsp;", " ")
		.replaceAll("&amp;", "&")
		.replaceAll("&quot;", '"')
		.replaceAll("&#x27;", "'")
		.replaceAll("&#039;", "'")
		.replace(/[\s\u3000]+/g, " ")
		.trim();

async function get(path) {
	const response = await fetch(`${base}${path}`, {
		headers: { "user-agent": "wasuta-archive research contact: repository maintainer" },
	});
	if (!response.ok) throw new Error(`${response.status} ${path}`);
	return response.text();
}

const costumes = [];
for (let page = 1; ; page += 1) {
	const listingPath = `/contents/closet/page/${page}`;
	const html = await get(listingPath);
	const pageItems = [];
	for (const match of html.matchAll(/<li class="c_thumb-list-item[^"]*">([\s\S]*?)<\/li>/g)) {
		const block = match[1];
		const contentPath = block.match(/href="(\/contents\/\d+)"/)?.[1];
		const publishedOn = block.match(/<time[^>]*datetime="([^"]+)"/)?.[1];
		const name = decode(
			block.match(/<h2 class="c_thumb-list-heading">([\s\S]*?)<\/h2>/)?.[1] ?? "",
		);
		if (contentPath && publishedOn && name)
			pageItems.push({
				name,
				publishedOn,
				sourceUrl: `${base}${contentPath}`,
				listingUrl: `${base}${listingPath}`,
			});
	}
	if (pageItems.length === 0) break;
	costumes.push(...pageItems);
	await wait(500);
}

const unique = [...new Map(costumes.map((costume) => [costume.sourceUrl, costume])).values()];
const artifact = {
	source: "わーすた公式ファンクラブ わーすた衣装博物館",
	retrievedAt: new Date().toISOString(),
	notes: [
		"公開一覧に表示された公式衣装名と記事URLのみを収録しています。",
		"publishedOnは記事公開日であり、衣装の初登場日ではありません。",
		"会員限定の本文と画像は取得・保存していません。",
	],
	costumes: unique,
};
await mkdir("data/research", { recursive: true });
await writeFile(output, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ output, costumes: unique.length }));
