import { faSquareXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import MovieCard from "@/components/events/MovieCard";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { ArticleJsonLd, NextSeo } from "@/components/seo";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useClearQueryParam } from "@/hooks/useClearQueryParam";
import { createYoutubeLink } from "@/lib/supabase/createYoutubeLink";
import { getMovies } from "@/lib/supabase/getMovies";
import { getYoutubeTags } from "@/lib/supabase/getYoutubeTags";
import type { Movie } from "@/types/movie";
import type { TagType } from "@/types/tag";
import formatDate from "@/utils/formatDate";
import { supabase } from "../../lib/supabaseClient";
import styles from "./eventDetail.module.scss";

// イベント詳細ページのプロパティ型定義
interface EventDetailsProps {
	event: any;
	youtubeLinks: any[];
}

const defaultImageUrl = "/event-placeholder.png";

export async function getServerSideProps({
	params,
}: {
	params: { [key: string]: string };
}) {
	const { id } = params;

	let event = null;
	let youtubeLinks: Movie[] = [];

	try {
		// IDに基づいてイベントの詳細を取得
		const { data: eventData, error: eventError } = await supabase
			.from("events")
			.select("*")
			.eq("event_id", id)
			.single();

		if (eventError) throw eventError;

		event = eventData || null;

		// イベントに紐づくYouTubeリンクを取得
		let linksData: Movie[];
		let linksError: any;
		try {
			linksData = await getMovies({
				eventId: Number.parseInt(id, 10),
				limit: 6,
			});
		} catch (error) {
			console.error(`Error fetching movies: ${(error as any).message}`);
			linksData = [];
		}

		if (linksError) throw linksError;

		youtubeLinks = linksData || [];
	} catch (error) {
		console.error("Error fetching data:", error);
	}

	if (!event) return { notFound: true };
	return { props: { event, youtubeLinks } };
}

// URLと改行を適切に扱う
const escapeHtml = (unsafe: string): string => {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

const isValidUrl = (url: string): boolean => {
	try {
		const parsedUrl = new URL(url);
		return ["http:", "https:"].includes(parsedUrl.protocol);
	} catch {
		return false; // 不正な形式またはサポートされていないプロトコルのURL
	}
};

function linkifyUrls(text: string): string {
	return text.replace(/(https?:\/\/[^\s<]+)/g, (url: string) => {
		if (isValidUrl(url)) {
			return `<a href="${escapeHtml(
				url,
			)}" target="_blank" rel="noopener noreferrer" class="underline break-all">${escapeHtml(
				url,
			)}</a>`;
		}
		return escapeHtml(url); // URLが無効な場合は、リンク化せずにエスケープしたテキストを返す
	});
}

const formatDescription = (description: string): string => {
	if (!description) return "未設定";

	let sanitizedDescription: string = escapeHtml(description);

	sanitizedDescription = sanitizedDescription.replace(/\n/g, "<br/>");
	sanitizedDescription = linkifyUrls(sanitizedDescription);

	return sanitizedDescription;
};

const EventDetailsPage = ({ event, youtubeLinks }: EventDetailsProps) => {
	const { isLoggedIn } = useAuth();
	const [loading, setLoading] = useState<boolean>(false);

	const id = event?.event_id;
	const [url, setUrl] = useState("");

	const ogImage = useMemo(() => {
		return `https://www.wasuta-archive.com/api/og?title=${
			event.event_name
		}&image=${event.image_url || defaultImageUrl}`;
	}, [event.event_name, event.image_url]);

	const [allYoutubeTags, setAllYoutubeTags] = useState<TagType[]>([]);
	const [selectedYoutubeTags, setSelectedYoutubeTags] = useState<TagType[]>([]);
	const fetchAllYoutubeTags = useCallback(async () => {
		const tags = await getYoutubeTags(null);
		if (tags) {
			setAllYoutubeTags(tags);
		}
	}, []);
	const handleYoutubeTagSelect = (tag: TagType) => {
		if (selectedYoutubeTags.some((t) => t.id === tag.id)) {
			setSelectedYoutubeTags(
				selectedYoutubeTags.filter((t) => t.id !== tag.id),
			);
		} else {
			setSelectedYoutubeTags([...selectedYoutubeTags, tag]);
		}
	};

	const router = useRouter();
	const toastParam = (router.query?.toast as string) || null;
	useClearQueryParam("toast", toastParam === "success");

	useEffect(() => {
		if (toastParam === "success") {
			toast.success("保存しました🌏");
		}
		fetchAllYoutubeTags();
	}, [toastParam, fetchAllYoutubeTags]);

	// YouTubeリンクの追加処理
	const handleSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		setLoading(true);

		if (isLoggedIn) {
			try {
				const selectedYoutubeTagIds = selectedYoutubeTags.map((tag) => tag.id);
				await createYoutubeLink(url, selectedYoutubeTagIds, id);
				setLoading(false);
				toast.success("動画を登録しました🌏");
				router.push(`/events/${id}`);
				setUrl("");
				setSelectedYoutubeTags([]);
			} catch (error) {
				if ((error as any).code === "23505") {
					setLoading(false);
					toast.error(
						"その動画は既に登録されています。別のURLを入力してください🙇‍♂️",
					);
				} else {
					setLoading(false);
					toast.error(`動画の登録中にエラーが発生しました😢（${error}）`);
				}
			}
		} else {
			setLoading(false);
			toast.error("ログインが必要です🙇‍♂️");
		}
	};

	return (
		<>
			<NextSeo
				title={event.event_name}
				openGraph={{
					images: [
						{
							url: ogImage || process.env.defaultOgpImage || "",
							width: 1200,
							height: 630,
						},
					],
				}}
			/>
			<ArticleJsonLd
				type="BlogPosting"
				url={`https://www.wasuta-archive.com/events/${id}`}
				headline={event.event_name}
				image={[event.image_url || process.env.defaultOgpImage || ""]}
				datePublished={`${event.date}T00:00:00+09:00`}
				author="わーすたアーカイブ"
				description={event.description}
			/>
			<DefaultLayout>
				<article className={styles.page}>
					<header className={styles.hero}>
						<img
							src={event.image_url || defaultImageUrl}
							alt={event.event_name}
						/>
						<div className={styles.shade} />
						<div className={styles.heroInner}>
							<Link href="/events" className={styles.back}>
								← イベント一覧へ
							</Link>
							<p className={styles.eyebrow}>EVENT RECORD</p>
							<h1>{event.event_name}</h1>
							<div className={styles.heroMeta}>
								<span>
									<FontAwesomeIcon icon={faCalendar} />
									{formatDate(event.date)}
								</span>
								<span>
									<FontAwesomeIcon icon={faLocationDot} />
									{event.location || "場所の記録なし"}
								</span>
							</div>
						</div>
					</header>
					<div className={styles.body}>
						<div className={styles.layout}>
							<section className={styles.main}>
								<p className={styles.sectionLabel}>ABOUT THIS DAY</p>
								<h2>この日の記録</h2>
								<div
									className={styles.description}
									// biome-ignore lint/security/noDangerouslySetInnerHtml: content is escaped before links are added
									dangerouslySetInnerHTML={{
										__html: formatDescription(event.description),
									}}
								/>
							</section>
							<aside className={styles.side}>
								<p className={styles.sectionLabel}>FACTS</p>
								<h2>記録情報</h2>
								<dl>
									<div className={styles.fact}>
										<dt>DATE</dt>
										<dd>{formatDate(event.date)}</dd>
									</div>
									<div className={styles.fact}>
										<dt>PLACE</dt>
										<dd>{event.location || "未設定"}</dd>
									</div>
									<div className={styles.fact}>
										<dt>ARCHIVE ID</dt>
										<dd>EVENT — {id}</dd>
									</div>
								</dl>
								<div className={styles.sideActions}>
									<a
										href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.wasuta-archive.com/events/${id}`)}&text=${encodeURIComponent(event.event_name)}&hashtags=${encodeURIComponent("わーすた,わーすたアーカイブ")}`}
										target="_blank"
										rel="noopener noreferrer"
										className={styles.share}
									>
										<FontAwesomeIcon icon={faSquareXTwitter} /> Xで共有
									</a>
									{isLoggedIn && (
										<Link href={`/events/${id}/edit`} className={styles.edit}>
											記録を編集
										</Link>
									)}
								</div>
							</aside>
						</div>
					</div>
					<section className={styles.movies}>
						<div className={styles.sectionHead}>
							<div>
								<p className={styles.sectionLabel}>MOVIES FROM THIS DAY</p>
								<h2>この日の映像</h2>
							</div>
							<Link href={`/events/${id}/movie`}>すべて見る →</Link>
						</div>
						<div className={styles.movieRail}>
							{youtubeLinks.length > 0 ? (
								youtubeLinks.map((link) => (
									<div key={link.youtube_link_id}>
										<MovieCard
											videoUrl={link.youtube_links.url}
											id={link.youtube_link_id}
										/>
									</div>
								))
							) : (
								<p className={styles.empty}>
									この日に紐づく映像は、まだ登録されていません。
								</p>
							)}
						</div>
					</section>
					{isLoggedIn && (
						<section className={styles.admin}>
							<p className={styles.sectionLabel}>EDITOR TOOL</p>
							<h2>この日に動画を追加</h2>
							<form onSubmit={handleSubmit}>
								<div className={styles.adminField}>
									<label htmlFor="url">YouTube URL</label>
									<input
										id="url"
										type="url"
										required
										value={url}
										onChange={(e) => setUrl(e.target.value)}
									/>
								</div>
								<fieldset className={styles.adminField}>
									<legend>タグ</legend>
									<p className={styles.tagSelectionStatus} aria-live="polite">
										{selectedYoutubeTags.length > 0
											? `${selectedYoutubeTags.length}件選択中。チェック付きのタグが登録されます。`
											: "未選択です。必要なタグを押して選択してください。"}
									</p>
									<div className={styles.adminTags}>
										{allYoutubeTags.map((tag) => (
											<button
												key={tag.id}
												type="button"
												aria-pressed={selectedYoutubeTags.some(
													(item) => item.id === tag.id,
												)}
												className={styles.videoTag}
												onClick={() => handleYoutubeTagSelect(tag)}
											>
												<span aria-hidden="true" className={styles.videoTagIcon}>
													{selectedYoutubeTags.some((item) => item.id === tag.id)
														? "✓"
														: "+"}
												</span>
												{tag.label}
											</button>
										))}
									</div>
								</fieldset>
								<button
									type="submit"
									disabled={loading}
									className={styles.submitButton}
								>
									{loading ? "登録中…" : "動画を登録する"}
								</button>
							</form>
						</section>
					)}
				</article>
				{loading && <LoadingSpinner />}
			</DefaultLayout>
		</>
	);
};

export default EventDetailsPage;
