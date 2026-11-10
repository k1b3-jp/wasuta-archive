export const phases = ["before", "day", "after", "recollection"] as const;
export type Phase = (typeof phases)[number];
export const phaseLabels: Record<Phase, string> = {
	before: "開催前",
	day: "当日",
	after: "終演後",
	recollection: "後年の回想",
};
export type ExhibitCard = {
	id: string;
	event_id: number;
	member_id: number | null;
	speaker: string;
	phase: Phase;
	relation_kind: "announcement" | "performance_report" | "reflection";
	summary: string;
	locator: string;
	published_on: string | null;
	published_at: string | null;
	date_precision: "day" | "instant" | "unknown";
	original_date_label: string | null;
	original_publication_confirmed: boolean;
	source: {
		url: string;
		title: string;
		publisher: string | null;
		availability_status: string;
	};
};
export type Exhibit = {
	event: {
		event_id: number;
		event_name: string;
		date: string;
		location: string | null;
	};
	members: { member_id: number; name: string; timeline_key: string | null }[];
	cards: ExhibitCard[];
	songs: { song_id: number; title: string; relation_type: string }[];
	candidateSongs?: { song_id: number; title: string; claim_id: string }[];
	editorialPreview: boolean;
};
export function safeSourceUrl(url: string): string | null {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "https:" && !parsed.username && !parsed.password
			? parsed.href
			: null;
	} catch {
		return null;
	}
}
// Date-only sources are compared as days, never assigned a synthetic midnight.
export function visibleCards(
	cards: ExhibitCard[],
	member: string,
	cutoff: string | null,
) {
	return cards
		.filter(
			(card) =>
				(!member ||
					(member.startsWith("speaker:")
						? card.speaker === member.slice(8)
						: String(card.member_id) === member)) &&
				(!cutoff ||
					(card.original_publication_confirmed &&
						card.published_on !== null &&
						card.published_on <= cutoff)),
		)
		.sort(
			(a, b) =>
				(a.published_on ?? "9999").localeCompare(b.published_on ?? "9999") ||
				a.id.localeCompare(b.id),
		);
}
export function localEditorialPreviewAllowed(
	env: NodeJS.ProcessEnv,
	remoteAddress: string | undefined,
) {
	if (env.NODE_ENV !== "development" || env.MUSEUM_EDITORIAL_PREVIEW !== "1")
		return false;
	try {
		return (
			["127.0.0.1", "localhost"].includes(
				new URL(env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname,
			) &&
			["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remoteAddress ?? "")
		);
	} catch {
		return false;
	}
}

export function eventEvidenceLabel(
	eventDate: string,
	cards: ExhibitCard[],
	editorialPreview: boolean,
	asOf = "2026-11-08",
) {
	if (eventDate > asOf) return "予定（調査基準日より後）";
	if (!cards.some((card) => card.relation_kind === "performance_report"))
		return "実施確認資料は未収録（告知だけでは実施済みにしません）";
	return editorialPreview
		? "実施に関する資料あり・編集承認待ち"
		: "実施を報告する承認済み資料あり";
}
