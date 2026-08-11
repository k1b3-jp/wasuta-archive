import type { Event } from "@/types/event";
import { supabase } from "../supabaseClient";

export async function getTimelineEvents(year: number): Promise<Event[]> {
	const { data, error } = await supabase
		.from("events")
		.select("event_id,event_name,location,date,description")
		.gte("date", `${year}-01-01`)
		.lte("date", `${year}-12-31`)
		.order("date", { ascending: true });
	if (error) throw error;
	return (data ?? []).map((event) => ({
		...event,
		event_id: String(event.event_id),
		image_url: "",
		description:
			event.description?.length > 240
				? `${event.description.slice(0, 237)}…`
				: (event.description ?? ""),
		location: event.location ?? "",
	}));
}
