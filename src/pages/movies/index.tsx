import { useEffect, useMemo, useState, useTransition } from "react";
import useSWRInfinite from "swr/infinite";
import MovieCard from "@/components/events/MovieCard";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import Tag from "@/components/ui/Tag";
import { getMovies } from "@/lib/supabase/getMovies";
import { getYoutubeTags } from "@/lib/supabase/getYoutubeTags";
import styles from "@/styles/archiveList.module.scss";
import type { Movie } from "@/types/movie";
import type { TagType } from "@/types/tag";

export default function MoviesPage() {
	const [allTags, setAllTags] = useState<TagType[]>([]);
	const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();
	useEffect(() => {
		getYoutubeTags(null)
			.then((tags) => Array.isArray(tags) && setAllTags(tags))
			.catch(console.error);
	}, []);

	const fetchMovies = async ({
		page,
		limit,
	}: {
		page: number;
		limit: number;
	}) => {
		setLoading(true);
		setError("");
		try {
			return await getMovies({
				tags: selectedTags.map((tag) => tag.id),
				start: page * limit,
				end: page * limit + limit - 1,
			});
		} catch (err) {
			console.error(err);
			setError("動画の取得中にエラーが発生しました");
			return [];
		} finally {
			setLoading(false);
		}
	};
	const { data, size, setSize, mutate } = useSWRInfinite(
		(pageIndex, previous: any[]) =>
			previous && !previous.length ? null : { page: pageIndex, limit: 12 },
		fetchMovies,
	);
	const movies = useMemo(
		() =>
			data
				?.flatMap((page) => page || [])
				.filter((movie: Movie) => movie?.youtube_link_id) || [],
		[data],
	);
	const toggleTag = (tag: TagType) =>
		setSelectedTags((current) =>
			current.some((item) => item.id === tag.id)
				? current.filter((item) => item.id !== tag.id)
				: [...current, tag],
		);
	const search = () =>
		startTransition(async () => {
			await setSize(1);
			await mutate();
		});

	return (
		<>
			<NextSeo title="動画一覧" />
			<DefaultLayout>
				<div className={styles.page}>
					<header className={styles.hero}>
						<div className={styles.heroInner}>
							<p className={styles.eyebrow}>MOVIE ARCHIVE</p>
							<h1>何度でも、あの瞬間を再生する。</h1>
							<p className={styles.heroCopy}>
								ライブ映像、ミュージックビデオ、舞台裏。公開された映像から、記憶の続きを見つけられます。
							</p>
						</div>
					</header>
					<section
						className={styles.filters}
						aria-labelledby="movie-filter-title"
					>
						<div className={styles.filterInner}>
							<div className={styles.filterTop}>
								<h2 id="movie-filter-title">映像を絞り込む</h2>
								<span>タグから検索</span>
							</div>
							<div className={styles.filterGrid}>
								<div className={`${styles.field} ${styles.tagField}`}>
									<p>タグ</p>
									<div className={styles.tags}>
										{allTags.map((tag) => (
											<Tag
												key={tag.id}
												label={tag.label}
												selected={selectedTags.some(
													(item) => item.id === tag.id,
												)}
												onSelect={() => toggleTag(tag)}
											/>
										))}
									</div>
								</div>
								<div className={styles.action}>
									<button
										type="button"
										className={styles.searchButton}
										onClick={search}
										disabled={isPending}
									>
										この条件で探す <span>→</span>
									</button>
								</div>
							</div>
						</div>
					</section>
					<main className={styles.content}>
						<div className={styles.resultHead}>
							<div>
								<p>ARCHIVE MOVIES</p>
								<h2>映像の記録</h2>
							</div>
							<span>{movies.length}件を表示中</span>
						</div>
						<div className={styles.movieGrid}>
							{error && <div className={styles.status}>{error}</div>}
							{!error && !movies.length && (loading || isPending) && (
								<div className={styles.status}>映像を読み込んでいます…</div>
							)}
							{!error && !movies.length && !loading && !isPending && (
								<div className={styles.status}>
									条件に合う映像は見つかりませんでした。
								</div>
							)}
							{movies.map((movie: Movie) => (
								<MovieCard
									key={movie.youtube_link_id}
									videoUrl={movie.youtube_links?.url}
									id={movie.youtube_link_id}
								/>
							))}
						</div>
						{movies.length > 0 && (
							<div className={styles.more}>
								<button
									type="button"
									className={styles.moreButton}
									onClick={() => setSize(size + 1)}
									disabled={isPending || loading}
								>
									{isPending || loading ? "読み込み中…" : "さらに映像を見る"}
								</button>
							</div>
						)}
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
