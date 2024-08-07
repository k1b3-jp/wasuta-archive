import DefaultLayout from "@/app/layout";
import MovieCard from "@/components/events/MovieCard";
import BaseButton from "@/components/ui/BaseButton";
import Tag from "@/components/ui/Tag";
import { getMovies } from "@/lib/supabase/getMovies";
import { getYoutubeTags } from "@/lib/supabase/getYoutubeTags";
import type { Movie } from "@/types/movie";
import type { TagType } from "@/types/tag";
import { NextSeo } from "next-seo";
import React, { useEffect, useState } from "react";
import useSWRInfinite from "swr/infinite";

const EventListPage = () => {
	const [allTags, setAllTags] = useState<TagType[]>([]);
	const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchAllTags();
	}, []);

	const fetchAllTags = async () => {
		const tags = await getYoutubeTags();
		if (tags !== undefined) {
			setAllTags(tags);
		}
	};

	const handleTagSelect = (tag: TagType) => {
		if (selectedTags.some((t) => t.id === tag.id)) {
			setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
		} else {
			setSelectedTags([...selectedTags, tag]);
		}
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

	const handleSearch = () => {
		setSize(1).then(() => mutate());
	};

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
									<BaseButton onClick={handleSearch} label="検索" />
								</div>
							</div>
						</div>
						<main className="event-list grid-base py-10">
							{loading && <p>読み込み中...</p>}
							{error && <p className="text-red-500">{error}</p>}
							{movies?.map((items) => {
								return items?.map((link: Movie) => {
									return (
										<div key={link.youtube_link_id}>
											<MovieCard
												videoUrl={link?.youtube_links?.url}
												id={link.youtube_link_id}
											/>
										</div>
									);
								});
							})}
						</main>
						<div className="mb-6 px-6 text-center">
							<BaseButton
								label="もっと見る"
								onClick={() => {
									setSize(size + 1);
								}}
								white
							/>
						</div>
					</div>
				</div>
			</DefaultLayout>
		</>
	);
};

export default EventListPage;
