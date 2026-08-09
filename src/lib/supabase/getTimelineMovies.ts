import { supabase } from "../supabaseClient";

export type TimelineMovie = {
	youtube_link_id: number;
	event_id: number;
	events: {
		event_name: string;
		date: string;
	} | null;
	youtube_links: {
		url: string;
	} | null;
};

export async function getTimelineMovies() {
	const { data, error } = await supabase
		.from("event_youtube_links")
		.select(`
			youtube_link_id,
			event_id,
			events (event_name, date),
			youtube_links (url)
		`)
		.order("youtube_link_id", { ascending: false });

	if (error) throw new Error(error.message);

	return (data || [])
		.map<TimelineMovie>((item) => ({
			youtube_link_id: item.youtube_link_id,
			event_id: item.event_id,
			events: item.events?.[0] || null,
			youtube_links: item.youtube_links?.[0] || null,
		}))
		.filter((item) => Boolean(item.events?.date && item.youtube_links?.url));
}
