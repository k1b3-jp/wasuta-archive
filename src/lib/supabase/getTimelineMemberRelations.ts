import { supabase } from "../supabaseClient";

export type TimelineMemberRelations = {
	events: Record<string, string[]>;
	songs: Record<string, string[]>;
	costumes: Record<string, string[]>;
};

type RelationRow = {
	entityId: string | number;
	members:
		| { timeline_key: string | null }
		| Array<{ timeline_key: string | null }>
		| null;
};

const asArray = <T>(value: T | T[] | null): T[] =>
	value ? (Array.isArray(value) ? value : [value]) : [];
const toRecord = (rows: RelationRow[]) =>
	rows.reduce<Record<string, string[]>>((result, row) => {
		const keys = asArray(row.members).flatMap((member) =>
			member.timeline_key ? [member.timeline_key] : [],
		);
		result[String(row.entityId)] = Array.from(
			new Set([...(result[String(row.entityId)] ?? []), ...keys]),
		);
		return result;
	}, {});

export async function getTimelineMemberRelations(): Promise<TimelineMemberRelations> {
	const [events, songs, costumes] = await Promise.all([
		supabase.from("event_members").select("event_id, members(timeline_key)"),
		supabase.from("song_members").select("song_id, members(timeline_key)"),
		supabase
			.from("costume_members")
			.select("costume_id, members(timeline_key)"),
	]);
	if (events.error) throw events.error;
	if (songs.error) throw songs.error;
	if (costumes.error) throw costumes.error;
	return {
		events: toRecord(
			(events.data ?? []).map((row) => ({
				entityId: row.event_id,
				members: row.members,
			})),
		),
		songs: toRecord(
			(songs.data ?? []).map((row) => ({
				entityId: row.song_id,
				members: row.members,
			})),
		),
		costumes: toRecord(
			(costumes.data ?? []).map((row) => ({
				entityId: row.costume_id,
				members: row.members,
			})),
		),
	};
}
