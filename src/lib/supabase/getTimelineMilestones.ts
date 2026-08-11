import { supabase } from "../supabaseClient";

export type TimelineMilestone = {
	occurrence_id: number;
	occurred_on: string;
	is_group_wide: boolean;
	title: string;
	description: string | null;
	member_names: string[];
	sources: Array<{ label: string; url: string }>;
	related_event_id: number | null;
};

type MilestoneQueryRow = {
	occurrence_id: number;
	occurred_on: string;
	is_group_wide: boolean;
	milestones:
		| {
				title: string;
				description: string | null;
				milestone_events: Array<{
					events: { event_id: number } | Array<{ event_id: number }> | null;
				}>;
		  }
		| Array<{
				title: string;
				description: string | null;
				milestone_events: Array<{
					events: { event_id: number } | Array<{ event_id: number }> | null;
				}>;
		  }>;
	occurrence_members: Array<{
		members: { name: string } | Array<{ name: string }> | null;
	}>;
	occurrence_sources: Array<{
		sources:
			| { title: string; url: string }
			| Array<{ title: string; url: string }>
			| null;
	}>;
};

const asArray = <T>(value: T | T[] | null | undefined): T[] =>
	value ? (Array.isArray(value) ? value : [value]) : [];

export async function getTimelineMilestones(): Promise<TimelineMilestone[]> {
	const { data, error } = await supabase
		.from("timeline_occurrences")
		.select(`
			occurrence_id,
			occurred_on,
			is_group_wide,
			milestones!inner (
				title,
				description,
				milestone_events (events (event_id))
			),
			occurrence_members (members (name)),
			occurrence_sources (sources (title, url))
		`)
		.eq("occurrence_kind", "milestone")
		.not("occurred_on", "is", null)
		.order("occurred_on", { ascending: true });

	if (error) throw new Error(error.message);

	return ((data || []) as unknown as MilestoneQueryRow[]).flatMap((row) => {
		const milestone = asArray(row.milestones)[0];
		if (!milestone) return [];
		return [
			{
				occurrence_id: row.occurrence_id,
				occurred_on: row.occurred_on,
				is_group_wide: row.is_group_wide,
				title: milestone.title,
				description: milestone.description,
				member_names: row.occurrence_members.flatMap((relation) =>
					asArray(relation.members).map((member) => member.name),
				),
				sources: row.occurrence_sources.flatMap((relation) =>
					asArray(relation.sources).map((source) => ({
						label: source.title,
						url: source.url,
					})),
				),
				related_event_id:
					asArray(milestone.milestone_events[0]?.events)[0]?.event_id || null,
			},
		];
	});
}
