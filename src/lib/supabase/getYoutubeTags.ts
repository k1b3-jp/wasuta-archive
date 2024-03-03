import { supabase } from "../supabaseClient";

export const getYoutubeTags = async (youtubeLinkId: number | null = null) => {
	if (youtubeLinkId) {
		// youtube_link_idが指定されている場合、そのYouTubeリンクに紐づくタグを取得
		const { data: youtubeTags, error } = await supabase
			.from("youtube_tags")
			.select(
				`
        tag_id,
        youtube_tag_names!inner(name)
      `,
			)
			.eq("youtube_link_id", youtubeLinkId);

		if (error) {
			console.error("Error fetching tags for youtube_link_id:", error);
			return [];
		}

		return youtubeTags?.map((tag: any) => ({
			id: tag.tag_id,
			label: tag.youtube_tag_names.name,
		}));
	} else {
		// youtube_link_idが指定されていない場合、すべてのYouTubeタグを取得
		const { data: tags, error } = await supabase
			.from("youtube_tag_names")
			.select("tag_id, name");

		if (error) {
			console.error("Error fetching all YouTube tags:", error);
			return [];
		}

		return tags?.map((tag) => ({
			id: tag.tag_id,
			label: tag.name,
		}));
	}
};
