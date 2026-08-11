import type { Costume } from "@/types/archive";
import { supabase } from "../supabaseClient";

const costumeSelect = `
  costume_id, name, debut_date, description, image_url,
  costume_sources (source_id, label, url, accessed_on),
  costume_events (relation_type, events (event_id, event_name, date, image_url))
`;

export async function getCostumes(): Promise<Costume[]> {
	const { data, error } = await supabase
		.from("costumes")
		.select(costumeSelect)
		.order("debut_date", { ascending: false, nullsFirst: false });
	if (error) throw error;
	return (data || []) as unknown as Costume[];
}

export async function getCostume(id: number): Promise<Costume | null> {
	const { data, error } = await supabase
		.from("costumes")
		.select(costumeSelect)
		.eq("costume_id", id)
		.maybeSingle();
	if (error) throw error;
	return data as unknown as Costume | null;
}
