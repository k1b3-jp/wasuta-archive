import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Exhibit, ExhibitCard } from "./model";

function publicClient(): SupabaseClient {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
		{
			auth: {
				persistSession: false,
				autoRefreshToken: false,
				detectSessionInUrl: false,
			},
		},
	);
}

export function isMissingMuseumRelation(
	error: { code?: string } | null | undefined,
) {
	return error?.code === "PGRST205" || error?.code === "42P01";
}

function logAndThrow(error: { code?: string; message?: string }): never {
	console.error(error);
	throw error;
}

// Missing museum relations become an empty list. Every other error is logged and rethrown unchanged.
export function museumCardsOrEmpty<T>(
	error: { code?: string; message?: string } | null | undefined,
	rows: T[] | null,
): T[] {
	if (!error) return rows ?? [];
	if (isMissingMuseumRelation(error)) return [];
	logAndThrow(error);
}

export function publicExhibitLinkVisible(
	error: { code?: string; message?: string } | null | undefined,
	rows: unknown[] | null,
): boolean {
	try {
		return museumCardsOrEmpty(error, rows).length > 0;
	} catch {
		return false;
	}
}

// One indexed lookup. A missing museum table means no public card, not a page error.
export async function hasPublicExhibitCard(eventId: number): Promise<boolean> {
	try {
		const { data, error } = await publicClient()
			.from("event_exhibit_cards")
			.select("research_key")
			.eq("event_id", eventId)
			.eq("status", "published")
			.eq("verification_status", "verified")
			.limit(1);
		return publicExhibitLinkVisible(error, data);
	} catch (error) {
		console.error(error);
		return false;
	}
}

export async function loadExhibit(eventId: number): Promise<Exhibit | null> {
	const supabase = publicClient();
	const [event, members, cards, songs] = await Promise.all([
		supabase
			.from("events")
			.select("event_id,event_name,date,location")
			.eq("event_id", eventId)
			.maybeSingle(),
		supabase
			.from("members")
			.select("member_id,name,timeline_key")
			.order("member_id"),
		// Explicit public conditions also protect requests with an authenticated editor session.
		supabase
			.from("event_exhibit_cards")
			.select(
				"research_key,event_id,member_id,speaker,phase,relation_kind,summary,locator,published_on,published_at,date_precision,original_date_label,original_publication_confirmed,source:sources(url,title,publisher,availability_status)",
			)
			.eq("event_id", eventId)
			.eq("status", "published")
			.eq("verification_status", "verified"),
		supabase
			.from("song_events")
			.select("relation_type,songs(song_id,title)")
			.eq("event_id", eventId),
	]);
	const cardRows = museumCardsOrEmpty(cards.error, cards.data);
	for (const error of [event.error, members.error, songs.error]) {
		if (error) logAndThrow(error);
	}
	if (!event.data) return null;
	return {
		event: event.data,
		members: members.data ?? [],
		cards: cardRows.map((row) => ({
			...row,
			id: row.research_key,
			source: Array.isArray(row.source) ? row.source[0] : row.source,
		})) as ExhibitCard[],
		songs: (songs.data ?? []).flatMap((row) => {
			const song = Array.isArray(row.songs) ? row.songs[0] : row.songs;
			return song ? [{ ...song, relation_type: row.relation_type }] : [];
		}),
		editorialPreview: false,
	};
}
