import type { NextSeoProps } from "next-seo/pages";

const CANONICAL_SITE_URL = "https://www.wasuta-archive.com";

export function getSiteUrl(): string {
	const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
		/\/$/,
		"",
	);
	if (configured) return configured;
	return CANONICAL_SITE_URL;
}

export function getDefaultOgImageUrl(): string {
	const configured = process.env.defaultOgpImage?.trim();
	if (configured) return configured;
	return `${getSiteUrl()}/opengraph-image.png`;
}

export function toAbsoluteUrl(value?: string | null): string | null {
	if (!value) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (trimmed.startsWith("/")) return `${getSiteUrl()}${trimmed}`;
	try {
		const url = new URL(trimmed);
		if (url.protocol === "http:" || url.protocol === "https:") {
			return url.toString();
		}
	} catch {
		return null;
	}
	return null;
}

export function buildGeneratedOgImageUrl(input: {
	title?: string | null;
	image?: string | null;
}): string {
	const params = new URLSearchParams();
	const title = input.title?.trim().slice(0, 80);
	if (title) params.set("title", title);
	const image = toAbsoluteUrl(input.image);
	if (image) params.set("image", image);
	return `${getSiteUrl()}/api/og?${params.toString()}`;
}

export function ogMeta(
	url: string,
	alt?: string,
): Pick<NextSeoProps, "openGraph" | "additionalMetaTags"> {
	return {
		openGraph: {
			images: [
				{
					url,
					width: 1200,
					height: 630,
					alt,
				},
			],
		},
		additionalMetaTags: [
			{
				name: "twitter:image",
				content: url,
				keyOverride: "twitter:image",
			},
		],
	};
}
