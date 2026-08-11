import type React from "react";
import { useEffect, useState } from "react";
import { getEventsByYoutubeLink } from "@/lib/supabase/getEventsByYoutubeLink";
import { getYoutubeTags } from "@/lib/supabase/getYoutubeTags";
import type { TagType } from "@/types/tag";
import MiniTag from "../ui/MiniTag";
import styles from "./MovieCard.module.scss";

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: fetch helpers intentionally rerun only when the link id changes
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
				console.warn("Invalid YouTube link ID for tags:", id);
				setYoutubeTags([]);
				return;
			}

			const tags = await getYoutubeTags(id);
			setYoutubeTags(tags);
		} catch (error) {
			console.error("Error fetching YouTube tags:", error);
			setYoutubeTags([]);
		}
	};

	const fetchEventName = async () => {
		try {
			// idが有効な数値かチェック
			if (!Number.isInteger(id) || id <= 0) {
				console.warn("Invalid YouTube link ID:", id);
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
			console.error("Error fetching event name:", error);
			setEventName(null);
		}
	};

	return (
		<article className={styles.card}>
			<div className={styles.frame}>
				{videoId ? (
					<iframe
						width="340"
						height="190"
						src={`https://www.youtube.com/embed/${videoId}`}
						loading="lazy"
						title="YouTube video player"
						allowFullScreen
					/>
				) : (
					<p className={styles.invalid}>動画URLを確認できません</p>
				)}
			</div>
			<div className={styles.body}>
				<p className={styles.label}>ARCHIVE MOVIE</p>
				<p className={styles.eventName}>
					{eventName || "わーすた アーカイブ映像"}
				</p>
				<div className={styles.tags}>
					{youtubeTags?.map(
						(tag: { id: React.Key | null | undefined; label: string }) => (
							<MiniTag key={tag.id} label={tag.label} />
						),
					)}
				</div>
			</div>
		</article>
	);
};

export default MovieCard;
