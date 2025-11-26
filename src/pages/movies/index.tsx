import DefaultLayout from "@/components/layout/DefaultLayout";
// import MovieCard from "@/components/events/MovieCard";

// MovieCardをクライアントサイドのみでレンダリング
const MovieCard = dynamic(() => import("@/components/events/MovieCard"), {
	ssr: false,
	loading: () => <div className="h-[190px] bg-gray-200 animate-pulse rounded" />
});
import BaseButton from "@/components/ui/BaseButton";
import Tag from "@/components/ui/Tag";
import { getMovies } from "@/lib/supabase/getMovies";
import { getYoutubeTags } from "@/lib/supabase/getYoutubeTags";
import type { Movie } from "@/types/movie";
import type { TagType } from "@/types/tag";
import { NextSeo } from "next-seo";
import React, { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import useSWRInfinite from "swr/infinite";

const MoviesContent = () => {
	const [allTags, setAllTags] = useState<TagType[]>([]);
	const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		fetchAllTags();
	}, []);

	const fetchAllTags = async () => {
		try {
			const tags = await getYoutubeTags(null);
			if (tags && Array.isArray(tags)) {
				setAllTags(tags);
			}
		} catch (error) {
			console.error('タグの取得に失敗しました:', error);
		}
	};

	const handleTagSelect = (tag: TagType) => {
		startTransition(() => {
			if (selectedTags.some((t) => t.id === tag.id)) {
				setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
			} else {
				setSelectedTags([...selectedTags, tag]);
			}
		});
	};

	type FetchEventsParams = {
		page: number;
		limit: number;
	};

	const fetchMovies = async ({ page, limit }: FetchEventsParams) => {
		const start = limit * page;
		const end = start + limit - 1;

		setLoading(true);
		setError("");

		try {
			const selectedTagIds = selectedTags.map((tag) => tag.id);
			const moviesData = await getMovies({
				tags: selectedTagIds,
				start: start,
				end: end,
			});
			return moviesData;
		} catch (err) {
			setError("イベントの取得中にエラーが発生しました");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const [limit] = useState(12);
	const getKey = (pageIndex: number, previousPageData: any[]) => {
		if (previousPageData && !previousPageData.length) return null; // 最後に到達した
		return { page: pageIndex, limit: limit };
	};

	const {
		data: movies,
		size,
		setSize,
		mutate,
	} = useSWRInfinite<any>(getKey, fetchMovies);

	const handleSearch = async () => {
		startTransition(async () => {
			await setSize(1);
			await mutate();
		});
	};

	const handleLoadMore = () => {
		startTransition(() => {
			setSize(size + 1);
		});
	};

	return (
		<div>
			<div className="mx-auto">
				<div className="search-form p-2 bg-light-gray bg-100vw flex">
					<div className="flex flex-col gap-4 mx-auto bg-white p-4 rounded-lg lg:w-[700px]">
						<div className="flex flex-col gap-2">
							<label className="text-sm font-bold">タグ</label>
							<div className="flex flex-wrap gap-2 mb-2">
								{allTags.map((tag) => (
									<Tag
										key={tag.id}
										label={tag.label}
										selected={selectedTags.some((t) => t.id === tag.id)}
										onSelect={() => handleTagSelect(tag)}
									/>
								))}
							</div>
						</div>
						<div className="text-center">
							<BaseButton onClick={handleSearch} label="検索" disabled={isPending} />
						</div>
					</div>
				</div>
				<main className="event-list grid-base py-10">
					{(loading || isPending) && <p>読み込み中...</p>}
					{error && <p className="text-red-500">{error}</p>}
					{movies?.flatMap((items, pageIndex) => {
						if (!items || !Array.isArray(items)) {
							console.warn('Invalid items array at page:', pageIndex, items);
							return [];
						}

						return items
							.filter((link: Movie) => {
								// 基本的なオブジェクト検証のみ（getMoviesで詳細検証済み）
								if (!link || typeof link !== 'object') {
									console.warn('Invalid link object:', link);
									return false;
								}
								// getMoviesで既に検証済みだが、念のため最低限のチェック
								if (!link.youtube_link_id) {
									console.warn('Missing youtube_link_id:', link);
									return false;
								}
								return true;
							})
							.map((link: Movie) => (
								<div key={`${pageIndex}-${link.youtube_link_id}`}>
									<MovieCard
										videoUrl={link?.youtube_links?.url}
										id={link.youtube_link_id}
									/>
								</div>
							));
					}) || []}
				</main>
				<div className="mb-6 px-6 text-center">
					<BaseButton
						label="もっと見る"
						onClick={handleLoadMore}
						white
						disabled={isPending}
					/>
				</div>
			</div>
		</div>
	);
};

// クライアントサイドでのみレンダリングするコンポーネント
const ClientOnlyMoviesContent = dynamic(() => Promise.resolve(MoviesContent), {
	ssr: false,
	loading: () => (
		<div className="mx-auto">
			<div className="search-form p-2 bg-light-gray bg-100vw flex">
				<div className="flex flex-col gap-4 mx-auto bg-white p-4 rounded-lg lg:w-[700px]">
					<div className="flex flex-col gap-2">
						<label className="text-sm font-bold">タグ</label>
						<div className="flex flex-wrap gap-2 mb-2">
							<div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
							<div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
							<div className="h-8 w-18 bg-gray-200 animate-pulse rounded"></div>
						</div>
					</div>
					<div className="text-center">
						<div className="h-10 w-20 bg-gray-200 animate-pulse rounded mx-auto"></div>
					</div>
				</div>
			</div>
			<main className="event-list grid-base py-10">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(12)].map((_, index) => (
						<div key={index} className="h-[190px] bg-gray-200 animate-pulse rounded" />
					))}
				</div>
			</main>
		</div>
	)
});

const EventListPage = () => {
	return (
		<>
			<NextSeo
				title="動画一覧"
				openGraph={{
					images: [
						{
							url: process.env.defaultOgpImage || "",
							width: 1200,
							height: 630,
							alt: "Og Image Alt",
						},
					],
				}}
			/>
			<DefaultLayout>
				<ClientOnlyMoviesContent />
			</DefaultLayout>
		</>
	);
};

export default EventListPage;
