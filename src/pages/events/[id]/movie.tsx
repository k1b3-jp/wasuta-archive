import DefaultLayout from "@/app/layout";
import MovieCard from "@/components/events/MovieCard";
import BaseButton from "@/components/ui/BaseButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Tag from "@/components/ui/Tag";
import { deleteYoutubeLink } from "@/lib/supabase/deleteYoutubeLink";
import { getMovies } from "@/lib/supabase/getMovies";
import { getYoutubeTags } from "@/lib/supabase/getYoutubeTags";
import type { Movie } from "@/types/movie";
import type { TagType } from "@/types/tag";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabaseClient";

const EventMovieList = () => {
	const router = useRouter();
	const { id } = router?.query;

	const [movies, setMovies] = useState<Movie[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [allTags, setAllTags] = useState<TagType[]>([]);
	const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const [isAdmin, setIsAdmin] = useState(false);
	const isSuperAdmin = async () => {
		try {
			const { data } = await supabase.auth.getUser();
			const userEmail = data?.user?.email;
			if (userEmail === process.env.NEXT_PUBLIC_ADMIN_USER_EMAIL) {
				setIsAdmin(true);
			} else {
				setIsAdmin(false);
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
			setIsAdmin(false);
		}
	};

	type ParamsType = {
		eventId: number;
		tags?: string[];
	};

	const fetchMovies = useCallback(
		async (selectedTags?: TagType[]) => {
			if (id !== undefined) {
				try {
					const params: ParamsType = { eventId: Number(id) };
					if (selectedTags) {
						const selectedTagIds = selectedTags.map((tag) => tag.id);
						params["tags"] = selectedTagIds;
					}
					const fetchedMovies: Movie[] = await getMovies(params);
					setMovies(fetchedMovies);
				} catch (error) {
					console.error("Error fetching movies:", error);
					toast.error("動画の取得中にエラーが発生しました");
				}
			}
		},
		[id],
	);

	useEffect(() => {
		fetchAllTags();
		isSuperAdmin();

		if (id !== undefined) {
			fetchMovies();
		}
	}, [id, refreshKey, fetchMovies]);

	const deleteMovie = async (youtubeLinkId: number) => {
		try {
			await deleteYoutubeLink(youtubeLinkId, Number(id));
			toast.success("動画が正常に削除されました");
			setRefreshKey((old) => old + 1);
		} catch (error) {
			toast.error("動画の削除中にエラーが発生しました");
		}
	};

	const fetchAllTags = async () => {
		try {
			const tags = await getYoutubeTags();
			if (tags) {
				setAllTags(tags);
			}
		} catch (error) {
			console.error("Error fetching tags:", error);
			toast.error("タグの取得中にエラーが発生しました");
		}
	};

	const handleTagSelect = (tag: TagType) => {
		if (selectedTags.some((t) => t.id === tag.id)) {
			setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
		} else {
			setSelectedTags([...selectedTags, tag]);
		}
	};

	const handleSearch = async () => {
		try {
			setLoading(true);
			await fetchMovies(selectedTags);
		} catch (error) {
			toast.error("動画の取得中にエラーが発生しました");
		} finally {
			setLoading(false);
		}
	};

	// Dialogを使った確認と動画削除
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

	const openDialog = (movieId: number) => {
		if (movieId != null) {
			setSelectedMovieId(movieId);
			setIsDialogOpen(true);
		}
	};

	const closeDialog = () => {
		setIsDialogOpen(false);
		setSelectedMovieId(null);
	};

	const handleConfirm = () => {
		if (selectedMovieId) {
			deleteMovie(selectedMovieId);
			closeDialog();
		}
	};

	return (
		<>
			<NextSeo
				title="イベントに紐づく動画一覧"
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
					<div className="search-form p-8 bg-light-gray bg-100vw flex">
						<div className="mx-auto bg-white p-6 rounded-lg lg:w-[700px] w-full">
							<div className="flex flex-wrap gap-2 mb-4">
								{allTags.map((tag) => (
									<Tag
										key={tag.id}
										label={tag.label}
										selected={selectedTags.some((t) => t.id === tag.id)}
										onSelect={() => handleTagSelect(tag)}
									/>
								))}
							</div>
							<div className="text-center">
								<BaseButton onClick={handleSearch} label="絞り込む" />
							</div>
						</div>
					</div>
					<main className="event-list grid-base py-8">
						{movies.map((movie) => (
							<div key={movie.youtube_link_id}>
								<div className="mb-2">
									<MovieCard
										videoUrl={movie.youtube_links.url}
										id={movie.youtube_link_id}
									/>
								</div>
								<div className="flex justify-end">
									<div className="w-3/4">
										{isAdmin && (
											<BaseButton
												onClick={() => openDialog(movie.youtube_link_id)}
												label="動画を削除する"
												danger
											/>
										)}
									</div>
								</div>
							</div>
						))}
					</main>
					<ConfirmDialog
						open={isDialogOpen}
						onClose={closeDialog}
						onConfirm={handleConfirm}
						title="動画を削除しますか？"
						text="この操作は取り消せません。"
						confirmText="削除する"
					/>
				</div>
			</DefaultLayout>
		</>
	);
};

export default EventMovieList;
