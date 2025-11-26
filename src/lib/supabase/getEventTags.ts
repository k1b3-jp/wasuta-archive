import { supabase } from "../supabaseClient";

export const getEventTags = async (eventId = null) => {
    if (eventId) {
		// イベントIDが指定されている場合、そのイベントに紐づくタグを取得
		const { data: eventTags, error } = await supabase
			.from("event_tags")
			.select(
				`
        tag_id,
        event_tag_names!inner(name)
      `,
			)
			.eq("event_id", eventId);

		if (error) {
			console.error("Error fetching tags for event:", error);
			return [];
		}

        return eventTags?.map((tag: any) => ({
            id: tag.tag_id,
            label: tag.event_tag_names.name,
        }));
    }
    // イベントIDが指定されていない場合、すべてのタグを取得
    const { data: tags, error } = await supabase
        .from("event_tag_names")
        .select("tag_id, name");

    if (error) {
        console.error("Error fetching all tags:", error);
        return [];
    }

    return tags?.map((tag) => ({
        id: tag.tag_id,
        label: tag.name,
    }));
};
