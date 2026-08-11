import type { TimelineMember } from "@/data/timelineDemo";
import { supabase } from "../supabaseClient";

type TimelineMemberRow = {
	timeline_key: string | null;
	name: string;
	short_name: string | null;
	color: string | null;
};

export async function getTimelineMembers(): Promise<TimelineMember[]> {
	const { data, error } = await supabase
		.from("members")
		.select("timeline_key, name, short_name, color")
		.not("timeline_key", "is", null)
		.order("member_id", { ascending: true });

	if (error) throw new Error(error.message);

	return ((data || []) as TimelineMemberRow[]).flatMap((member) => {
		if (!member.timeline_key || !member.short_name) return [];
		return [
			{
				slug: member.timeline_key,
				name: member.name,
				shortName: member.short_name,
				color: member.color || "#d7cfd9",
			},
		];
	});
}
