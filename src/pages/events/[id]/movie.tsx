import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import MovieCard from "@/components/events/MovieCard";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Tag from "@/components/ui/Tag";
import { useAuth } from "@/contexts/AuthContext";
import { deleteYoutubeLink } from "@/lib/supabase/deleteYoutubeLink";
import { getMovies } from "@/lib/supabase/getMovies";
import { getYoutubeTags } from "@/lib/supabase/getYoutubeTags";
import { supabase } from "@/lib/supabaseClient";
import type { Movie } from "@/types/movie";
import type { TagType } from "@/types/tag";
import formatDate from "@/utils/formatDate";
import styles from "../movieArchive.module.scss";

type EventSummary = {
	event_id: number;
	event_name: string;
	date: string;
	location?: string | null;
};

export async function getServerSideProps({
	params,
}: {
	params: { id: string };
}) {
	const id = Number.parseInt(params.id, 10);
	if (!Number.isInteger(id)) return { notFound: true };
	const { data: event, error } = await supabase
		.from("events")
		.select("event_id,event_name,date,location")
		.eq("event_id", id)
		.maybeSingle();
	if (error || !event) return { notFound: true };
	return { props: { event } };
}

export default function EventMovieList({ event }: { event: EventSummary }) {
	const { isAdmin } = useAuth();
	const [movies, setMovies] = useState<Movie[]>([]);
	const [allTags, setAllTags] = useState<TagType[]>([]);
	const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

	const fetchMovies = useCallback(
		async (tags: TagType[] = []) => {
			setLoading(true);
			setError("");
			try {
				setMovies(
					await getMovies({
						eventId: event.event_id,
						tags: tags.map((tag) => tag.id),
					}),
				);
			} catch (fetchError) {
				console.error(fetchError);
				setError("映像の取得中にエラーが発生しました。");
			} finally {
				setLoading(false);
			}
		},
		[event.event_id],
	);

	useEffect(() => {
		void fetchMovies();
		getYoutubeTags(null)
			.then((tags) => tags && setAllTags(tags))
			.catch((tagError) => {
				console.error(tagError);
				toast.error("タグの取得中にエラーが発生しました");
			});
	}, [fetchMovies]);

	const toggleTag = (tag: TagType) =>
		setSelectedTags((current) =>
			current.some((item) => item.id === tag.id)
				? current.filter((item) => item.id !== tag.id)
				: [...current, tag],
		);
	const openDialog = (movieId: number) => {
		setSelectedMovieId(movieId);
		setIsDialogOpen(true);
	};
	const closeDialog = () => {
		setIsDialogOpen(false);
		setSelectedMovieId(null);
	};
	const deleteMovie = async () => {
		if (!selectedMovieId) return;
		try {
			await deleteYoutubeLink(selectedMovieId, event.event_id);
			toast.success("動画を削除しました");
			closeDialog();
			await fetchMovies(selectedTags);
		} catch {
			toast.error("動画の削除中にエラーが発生しました");
		}
	};

	return (
		<>
			<NextSeo
				title={`${event.event_name}の動画`}
				description={`${event.event_name}に関連する映像アーカイブ`}
			/>
			<DefaultLayout>
				<div className={styles.page}>
					<header className={styles.hero}>
						<div className={styles.inner}>
							<Link href={`/events/${event.event_id}`} className={styles.back}>
								← イベントの記録へ
							</Link>
							<p className={styles.eyebrow}>EVENT MOVIE ARCHIVE</p>
							<h1>{event.event_name}</h1>
							<p className={styles.heroMeta}>
								{formatDate(event.date)} · {event.location || "会場情報なし"}
							</p>
						</div>
					</header>
					<section className={styles.filter} aria-labelledby="movie-tags-title">
						<div className={styles.filterInner}>
							<div className={styles.filterHead}>
								<h2 id="movie-tags-title">映像を絞り込む</h2>
								<span>タグから検索</span>
							</div>
							<div className={styles.tags}>
								{allTags.map((tag) => (
									<Tag
										key={tag.id}
										label={tag.label}
										selected={selectedTags.some((item) => item.id === tag.id)}
										onSelect={() => toggleTag(tag)}
									/>
								))}
							</div>
							<div className={styles.filterAction}>
								<button
									type="button"
									onClick={() => fetchMovies(selectedTags)}
									disabled={loading}
								>
									この条件で探す →
								</button>
							</div>
						</div>
					</section>
					<main className={styles.content}>
						<div className={styles.resultHead}>
							<div>
								<p>MOVIES FROM THIS DAY</p>
								<h2>この日の映像</h2>
							</div>
							<span>{movies.length}件</span>
						</div>
						{loading ? (
							<div className={styles.status}>映像を読み込んでいます…</div>
						) : error ? (
							<div className={styles.status}>{error}</div>
						) : movies.length === 0 ? (
							<div className={styles.status}>
								この条件で表示できる映像はありません。
							</div>
						) : (
							<div className={styles.grid}>
								{movies.map((movie) => (
									<div className={styles.movieWrap} key={movie.youtube_link_id}>
										<MovieCard
											videoUrl={movie.youtube_links.url}
											id={movie.youtube_link_id}
										/>
										{isAdmin && (
											<div className={styles.adminRow}>
												<button
													type="button"
													className={styles.delete}
													onClick={() => openDialog(movie.youtube_link_id)}
												>
													動画を削除
												</button>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</main>
					<ConfirmDialog
						open={isDialogOpen}
						onClose={closeDialog}
						onConfirm={deleteMovie}
						title="動画を削除しますか？"
						text="この操作は取り消せません。"
						confirmText="削除する"
					/>
				</div>
			</DefaultLayout>
		</>
	);
}
