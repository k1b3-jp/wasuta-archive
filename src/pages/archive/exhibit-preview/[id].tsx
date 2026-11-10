import type { GetServerSideProps } from "next";
import ExhibitRoom from "@/components/museum/ExhibitRoom";
import { loadExhibit } from "@/lib/museum/load";
import {
	type Exhibit,
	type ExhibitCard,
	localEditorialPreviewAllowed,
} from "@/lib/museum/model";
export const getServerSideProps: GetServerSideProps = async ({
	params,
	req,
	res,
}) => {
	res.setHeader("Cache-Control", "private, no-store, max-age=0");
	res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
	if (
		!localEditorialPreviewAllowed(process.env, req.socket.remoteAddress) ||
		params?.id !== "167"
	)
		return { notFound: true };
	const exhibit = await loadExhibit(167);
	if (!exhibit) return { notFound: true };
	// Only this server-side development route can read research. Never import it into a client bundle.
	const { readFile } = await import("node:fs/promises");
	const localCards = await readFile(
		`${process.cwd()}/data/research/museum/cards.jsonl`,
		"utf8",
	).catch((error: NodeJS.ErrnoException) => {
		if (error.code === "ENOENT") return "";
		throw error;
	});
	if (!localCards.trim()) {
		exhibit.editorialPreview = true;
		return { props: { exhibit } };
	}
	const rows = localCards
		.trim()
		.split("\n")
		.map((line) => JSON.parse(line));
	exhibit.cards = rows.map(
		({
			id,
			event_id,
			member_id,
			speaker,
			phase,
			relation_kind,
			summary,
			locator,
			published_on,
			published_at,
			date_precision,
			original_date_label,
			original_publication_confirmed,
			source,
		}) => ({
			id,
			event_id,
			member_id,
			speaker,
			phase,
			relation_kind,
			summary,
			locator,
			published_on,
			published_at,
			date_precision,
			original_date_label,
			original_publication_confirmed,
			source,
		}),
	) as ExhibitCard[];

	const songRows = (
		await readFile(
			`${process.cwd()}/data/research/museum/song_candidates.jsonl`,
			"utf8",
		)
	)
		.trim()
		.split("\n")
		.map((line) => JSON.parse(line));
	exhibit.candidateSongs = songRows.map(({ song_id, title, claim_id }) => ({
		song_id,
		title,
		claim_id,
	}));
	exhibit.editorialPreview = true;
	return { props: { exhibit } };
};
export default function Preview({ exhibit }: { exhibit: Exhibit }) {
	return <ExhibitRoom exhibit={exhibit} />;
}
