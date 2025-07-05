import { getYoutubeTags } from "@/lib/supabase/getYoutubeTags";
import type { TagType } from "@/types/tag";
import type React from "react";
import { useEffect, useState } from "react";
import MiniTag from "../ui/MiniTag";
import { getEventsByYoutubeLink } from "@/lib/supabase/getEventsByYoutubeLink";

export function extractYouTubeVideoId(url: string): string | null {
	const matched =
		/^https?:\/\/(www\.|m\.)?youtube\.com\/watch\?(.*&)?v=([^&]+)/.exec(url) ??
		/^https?:\/\/youtu\.be\/([^?]+)/.exec(url) ??
		/^https?:\/\/(www\.|m\.)?youtube\.com\/embed\/([^?]+)/.exec(url);

	if (matched) {
		return matched[3] || matched[1];
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
		// idが有効な場合のみデータを取得
		if (id && Number.isInteger(id) && id > 0) {
			fetchYoutubeTags();
			fetchEventName();
		}
	}, [id]);

	const fetchYoutubeTags = async () => {
		try {
			// idが有効な数値かチェック
			if (!Number.isInteger(id) || id <= 0) {
				console.warn('Invalid YouTube link ID for tags:', id);
				setYoutubeTags([]);
				return;
			}

			const tags = await getYoutubeTags(id);
			setYoutubeTags(tags);
		} catch (error) {
			console.error('Error fetching YouTube tags:', error);
			setYoutubeTags([]);
		}
	};

	const fetchEventName = async () => {
		try {
			// idが有効な数値かチェック
			if (!Number.isInteger(id) || id <= 0) {
				console.warn('Invalid YouTube link ID:', id);
				setEventName(null);
				return;
			}

			const data: any = await getEventsByYoutubeLink(id);
			if (data && data.length > 0 && data[0].events) {
				setEventName(data[0].events.event_name);
			} else {
				setEventName(null);
			}
		} catch (error) {
			console.error('Error fetching event name:', error);
			setEventName(null);
		}
	};

	return (
		<div>
			<div className="mb-2">
				{videoId ? (
					<iframe
						width="320"
						height="200"
						src={`https://www.youtube.com/embed/${videoId}`}
						loading="lazy"
						title="YouTube video player"
						allowFullScreen
					/>
				) : (
					<p>Invalid URL</p>
				)}
			</div>
			<div className="text-sm line-clamp-1 leading-7 h-7 mb-2 max-w-[320px]">{eventName}</div>
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
