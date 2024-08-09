import { getYoutubeTags } from "@/lib/supabase/getYoutubeTags";
import type { TagType } from "@/types/tag";
import type React from "react";
import { useEffect, useState } from "react";
import MiniTag from "../ui/MiniTag";
import { getEventsByYoutubeLink } from "@/lib/supabase/getEventsByYoutubeLink";

export function extractYouTubeVideoId(url: string): string | null {
	const matched =
		/^https?:\/\/(www\.|m\.)?youtube\.com\/watch\?(.*&)?v=(?<videoId>[^&]+)/.exec(
			url,
		) ??
		/^https?:\/\/youtu\.be\/(?<videoId>[^?]+)/.exec(url) ??
		/^https?:\/\/(www\.|m\.)?youtube\.com\/embed\/(?<videoId>[^?]+)/.exec(url);

	if (matched?.groups?.videoId) {
		return matched.groups.videoId;
	}
	return null;
}

interface MovieCardProps {
	videoUrl: string;
	id: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ videoUrl, id }) => {
	const videoId = extractYouTubeVideoId(videoUrl); // URLからビデオIDを抽出

	// idに紐づくタグを取得する
	const [youtubeTags, setYoutubeTags] = useState<TagType[] | undefined>([]);
	const [eventName, setEventName] = useState<string | null>(null);

	useEffect(() => {
		fetchYoutubeTags();
		fetchEventName();
	}, []);

	const fetchYoutubeTags = async () => {
		const tags = await getYoutubeTags(id);
		setYoutubeTags(tags);
	};

	const fetchEventName = async () => {
		const data: any = await getEventsByYoutubeLink(id);
		setEventName(data[0].events.event_name);
	};

	return (
		<div>
			<div className="mb-2">
				{videoId ? <iframe width="340" height="190" src={`https://www.youtube.com/embed/${videoId}`} loading="lazy" title="YouTube video player" allowFullScreen /> : <p>Invalid URL</p>}
			</div>
			<div className="text-sm line-clamp-1 leading-7 h-7 mb-2">{eventName}</div>
			<div className="min-h-[28px]">
				{youtubeTags?.map(
					(tag: { id: React.Key | null | undefined; label: string }) => (
						<MiniTag key={tag.id} label={tag.label} />
					),
				)}
			</div>
		</div>
	);
};

export default MovieCard;
