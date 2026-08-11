import { supabase } from "../supabaseClient";

export type MemberArchive = {
	member: {
		timeline_key: string;
		name: string;
		short_name: string;
		color: string;
		joined_on: string | null;
		left_on: string | null;
	};
	events: Array<{
		event_id: number;
		event_name: string;
		date: string;
		image_url: string | null;
	}>;
	songs: Array<{
		song_id: number;
		title: string;
		date: string | null;
		image_url: string | null;
	}>;
	costumes: Array<{
		costume_id: number;
		name: string;
		date: string | null;
		image_url: string | null;
	}>;
	milestones: Array<{
		milestone_id: number;
		title: string;
		date: string | null;
	}>;
	videos: Array<{
		youtube_link_id: number;
		url: string;
		event_name: string;
		date: string;
	}>;
};

const first = <T>(value: T | T[] | null | undefined): T | null =>
	Array.isArray(value) ? (value[0] ?? null) : (value ?? null);

export async function getMemberArchive(
	timelineKey: string,
): Promise<MemberArchive | null> {
	const { data: member, error: memberError } = await supabase
		.from("members")
		.select(
			"member_id, timeline_key, name, short_name, color, joined_on, left_on",
		)
		.eq("timeline_key", timelineKey)
		.maybeSingle();
	if (memberError) throw memberError;
	if (!member?.timeline_key || !member.short_name) return null;
	const [eventRelations, songRelations, costumeRelations, milestoneRelations] =
		await Promise.all([
			supabase
				.from("event_members")
				.select("events(event_id, event_name, date, image_url)")
				.eq("member_id", member.member_id),
			supabase
				.from("song_members")
				.select(
					"songs(song_id, title, first_performed_date, release_date, image_url)",
				)
				.eq("member_id", member.member_id),
			supabase
				.from("costume_members")
				.select("costumes(costume_id, name, debut_date, image_url)")
				.eq("member_id", member.member_id),
			supabase
				.from("milestone_members")
				.select(
					"milestones(milestone_id, title, timeline_occurrences(occurred_on))",
				)
				.eq("member_id", member.member_id),
		]);
	const failed = [
		eventRelations,
		songRelations,
		costumeRelations,
		milestoneRelations,
	].find((result) => result.error);
	if (failed?.error) throw failed.error;
	const events = (eventRelations.data ?? []).flatMap((relation) => {
		const event = first(relation.events);
		return event ? [{ ...event, event_id: Number(event.event_id) }] : [];
	});
	const eventIds = events.map((event) => event.event_id);
	const { data: videoRelations, error: videoError } = eventIds.length
		? await supabase
				.from("event_youtube_links")
				.select("event_id, youtube_link_id, youtube_links(url)")
				.in("event_id", eventIds)
		: { data: [], error: null };
	if (videoError) throw videoError;
	return {
		member: {
			timeline_key: member.timeline_key,
			name: member.name,
			short_name: member.short_name,
			color: member.color ?? "#d7cfd9",
			joined_on: member.joined_on,
			left_on: member.left_on,
		},
		events: events.sort((a, b) => b.date.localeCompare(a.date)),
		songs: (songRelations.data ?? []).flatMap((relation) => {
			const song = first(relation.songs);
			return song
				? [
						{
							song_id: Number(song.song_id),
							title: song.title,
							date: song.first_performed_date ?? song.release_date,
							image_url: song.image_url,
						},
					]
				: [];
		}),
		costumes: (costumeRelations.data ?? []).flatMap((relation) => {
			const costume = first(relation.costumes);
			return costume
				? [
						{
							costume_id: Number(costume.costume_id),
							name: costume.name,
							date: costume.debut_date,
							image_url: costume.image_url,
						},
					]
				: [];
		}),
		milestones: (milestoneRelations.data ?? []).flatMap((relation) => {
			const milestone = first(relation.milestones);
			if (!milestone) return [];
			const occurrence = first(milestone.timeline_occurrences);
			return [
				{
					milestone_id: Number(milestone.milestone_id),
					title: milestone.title,
					date: occurrence?.occurred_on ?? null,
				},
			];
		}),
		videos: (videoRelations ?? []).flatMap((relation) => {
			const video = first(relation.youtube_links);
			const event = events.find((item) => item.event_id === relation.event_id);
			return video && event
				? [
						{
							youtube_link_id: relation.youtube_link_id,
							url: video.url,
							event_name: event.event_name,
							date: event.date,
						},
					]
				: [];
		}),
	};
}
