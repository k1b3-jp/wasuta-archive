import Head from "next/head";
import {
	type DefaultSeoProps,
	type NextSeoProps,
	generateDefaultSeo,
	generateNextSeo,
} from "next-seo/pages";
import { JsonLdScript } from "next-seo";

export { ArticleJsonLd } from "next-seo";

export function NextSeo(props: NextSeoProps) {
	return <Head>{generateNextSeo(props)}</Head>;
}

export function DefaultSeo(props: DefaultSeoProps) {
	return <Head>{generateDefaultSeo(props)}</Head>;
}

interface WebPageJsonLdProps {
	description?: string;
	id: string;
}

export function WebPageJsonLd({ description, id }: WebPageJsonLdProps) {
	return (
		<JsonLdScript
			scriptKey="web-page"
			data={{
				"@context": "https://schema.org",
				"@type": "WebPage",
				"@id": id,
				description,
			}}
		/>
	);
}
