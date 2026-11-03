import { ImageResponse } from "@vercel/og";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSiteUrl } from "@/lib/ogImage";

export const config = {
	runtime: "nodejs",
};

const SITE_NAME = "わーすたアーカイブ";

function firstQuery(value: string | string[] | undefined): string {
	if (Array.isArray(value)) return value[0] ?? "";
	return value ?? "";
}

function absoluteImageUrl(value: string): string | null {
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (trimmed.startsWith("/")) return `${getSiteUrl()}${trimmed}`;
	try {
		const url = new URL(trimmed);
		if (url.protocol !== "http:" && url.protocol !== "https:") return null;
		return url.toString();
	} catch {
		return null;
	}
}

export async function fetchFont(text: string): Promise<ArrayBuffer | null> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 4000);
	try {
		const googleFontsUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
		const cssResponse = await fetch(googleFontsUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
			},
			signal: controller.signal,
		});
		if (!cssResponse.ok) return null;
		const css = await cssResponse.text();
		const resource = css.match(
			/src:\s*url\(([^)]+)\)\s*format\(['"]?(opentype|truetype|woff)['"]?\)/,
		);
		if (!resource) return null;
		const fontUrl = resource[1].trim().replace(/^['"]|['"]$/g, "");
		const fontResponse = await fetch(fontUrl, { signal: controller.signal });
		if (!fontResponse.ok) return null;
		const font = await fontResponse.arrayBuffer();
		return font.byteLength > 0 ? font : null;
	} catch (error) {
		console.error("OG font fetch failed", error);
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

function OgCard({
	title,
	imageURL,
}: {
	title: string;
	imageURL: string | null;
}) {
	return (
		<div
			style={{
				backgroundImage: "linear-gradient(160deg, #ffffff 0%, #7bdcb5 100%)",
				backgroundSize: "100% 100%",
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "row",
				textAlign: "left",
				alignItems: "center",
				justifyContent: "flex-start",
				overflow: "hidden",
				fontFamily: "NotoSansJP",
			}}
		>
			<div
				style={{
					display: "flex",
					width: imageURL ? 520 : 1200,
					height: "100%",
					flexDirection: "column",
					justifyContent: "center",
					paddingLeft: 48,
					paddingRight: imageURL ? 16 : 48,
					color: "#2f2f2f",
				}}
			>
				<div
					style={{
						display: "flex",
						fontSize: 32,
						marginBottom: 20,
					}}
				>
					わーすたアーカイブ
				</div>
				<div
					style={{
						display: "flex",
						fontSize: title.length > 36 ? 40 : 52,
						lineHeight: 1.25,
						wordBreak: "break-word",
					}}
				>
					{title || "イベント、動画、楽曲、衣装の記録"}
				</div>
			</div>
			{imageURL ? (
				<div
					style={{
						display: "flex",
						width: 680,
						height: "100%",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{/* biome-ignore lint/performance/noImgElement: Satori renders this raw img into the PNG */}
					<img
						src={imageURL}
						alt=""
						width={600}
						height={460}
						style={{
							width: 600,
							height: 460,
							objectFit: "contain",
						}}
					/>
				</div>
			) : null}
		</div>
	);
}

function createOgImage(
	title: string,
	imageURL: string | null,
	fontData: ArrayBuffer | null,
) {
	return new ImageResponse(<OgCard title={title} imageURL={imageURL} />, {
		width: 1200,
		height: 630,
		fonts: fontData
			? [
					{
						name: "NotoSansJP",
						data: fontData,
						weight: 700,
						style: "normal",
					},
				]
			: undefined,
	});
}

async function sendPng(res: NextApiResponse, image: ImageResponse) {
	const bytes = Buffer.from(await image.arrayBuffer());
	res.writeHead(200, {
		"Content-Type": "image/png",
		"Cache-Control":
			"public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
	});
	res.end(bytes);
}

// Pages Router の Node.js ランタイムは Web の Response を return してもクライアントへ送らない。
// 生成した PNG を res に書き出さないと関数が終了せず、Vercel では FUNCTION_INVOCATION_TIMEOUT になる。
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "GET" && req.method !== "HEAD") {
		res.setHeader("Allow", "GET, HEAD");
		res.status(405).end("Method Not Allowed");
		return;
	}

	const title = firstQuery(req.query.title).trim().slice(0, 80);
	const imageURL = absoluteImageUrl(firstQuery(req.query.image));

	try {
		const fontData = await fetchFont(`${title}${SITE_NAME}`);
		try {
			await sendPng(res, createOgImage(title, imageURL, fontData));
		} catch (error) {
			if (!imageURL) throw error;
			console.error("OG image asset failed, retrying without it", error);
			await sendPng(res, createOgImage(title, null, fontData));
		}
	} catch (error) {
		console.error("Failed to generate the OG image", error);
		res.status(500).end("Failed to generate the image");
	}
}
