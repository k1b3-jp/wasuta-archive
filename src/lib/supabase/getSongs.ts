import type { Song } from "@/types/archive";
import { supabase } from "../supabaseClient";

const songSelect = `
  song_id, title, release_date, first_performed_date, description, image_url,
  song_sources (source_id, label, url, accessed_on),
  song_events (relation_type, events (event_id, event_name, date, image_url))
`;

export async function getSongs(): Promise<Song[]> {
	const { data, error } = await supabase
		.from("songs")
		.select(songSelect)
		.order("first_performed_date", { ascending: false, nullsFirst: false });
	if (error) throw error;
	return (data || []) as unknown as Song[];
}

export async function getSong(id: number): Promise<Song | null> {
	const { data, error } = await supabase
		.from("songs")
		.select(songSelect)
		.eq("song_id", id)
		.maybeSingle();
	if (error) throw error;
	return data as unknown as Song | null;
}
