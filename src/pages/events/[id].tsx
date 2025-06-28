import DefaultLayout from "@/app/layout";
import MovieCard from "@/components/events/MovieCard";
import BaseButton from "@/components/ui/BaseButton";
import Tag from "@/components/ui/Tag";
import { createYoutubeLink } from "@/lib/supabase/createYoutubeLink";
import { getMovies } from "@/lib/supabase/getMovies";
import { getYoutubeTags } from "@/lib/supabase/getYoutubeTags";
import type { Movie } from "@/types/movie";
import type { TagType } from "@/types/tag";
import formatDate from "@/utils/formatDate";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArticleJsonLd, NextSeo } from "next-seo";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { TwitterShareButton, XIcon } from "react-share";
import { toast } from "react-toastify";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import parse from "html-react-parser";
import { useClearQueryParam } from "@/hooks/useClearQueryParam";

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
			linksData = await getMovies({ eventId: Number.parseInt(id), limit: 6 });
		} catch (error) {
			console.error(`Error fetching movies: ${(error as any).message}`);
			linksData = [];
		}

		if (linksError) throw linksError;

		youtubeLinks = linksData || [];
	} catch (error) {
		console.error("Error fetching data:", error);
	}

	return {
		props: {
			event,
			youtubeLinks,
		},
	};
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
	} catch (e) {
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
	const [loading, setLoading] = useState<boolean>(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const validateAccess = async () => {
		const { data } = await supabase.auth.getSession();
		if (data.session !== null) {
			setIsLoggedIn(true);
		}
	};

	const id = event?.event_id;
	const [url, setUrl] = useState("");

	const ogImage = useMemo(() => {
		return `https://www.wasuta-archive.com/api/og?title=${event.event_name
			}&image=${event.image_url || defaultImageUrl}`;
	}, [event.event_name, event.image_url]);

	const [allYoutubeTags, setAllYoutubeTags] = useState<TagType[]>([]);
	const [selectedYoutubeTags, setSelectedYoutubeTags] = useState<TagType[]>([]);
	const fetchAllYoutubeTags = async () => {
		const tags = await getYoutubeTags(null);
		if (tags) {
			setAllYoutubeTags(tags);
		}
	};
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
	const query = useSearchParams();
	const toastParams = query?.get("toast");
	useClearQueryParam("toast", toastParams === "success");

	useEffect(() => {
		if (toastParams === "success") {
			toast.success("保存しました🌏");
		}
		validateAccess();
		fetchAllYoutubeTags();
	}, [toastParams, fetchAllYoutubeTags, validateAccess]);

	// YouTubeリンクの追加処理
	const handleSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		setLoading(true);

		if (isLoggedIn) {
			try {
				const selectedYoutubeTagIds = selectedYoutubeTags.map((tag) => tag.id);
				const insertedData = await createYoutubeLink(
					url,
					selectedYoutubeTagIds,
					id,
				);
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
				title={event.event_name}
				images={[event.image_url || process.env.defaultOgpImage || ""]}
				datePublished={`${event.date}T00:00:00+09:00`}
				authorName="わーすたアーカイブ"
				description={event.description}
			/>
			<DefaultLayout>
				<div>
					<div className="event">
						<div className="event-head bg-100vw bg-light-gray p-4">
							<img
								src={event.image_url || defaultImageUrl}
								alt={event.event_name}
								width={500}
								height={300}
								className="mx-auto"
							/>
						</div>
						<div className="event-detail p-6">
							<h1 className="text-font-color font-bold text-xl mb-4">
								{event.event_name}
							</h1>
							<div className="flex flex-row gap-2 items-center mb-4">
								<div className="bg-light-gray py-2 px-3 rounded">
									<FontAwesomeIcon icon={faCalendar} />
								</div>
								<p>{formatDate(event.date)}</p>
							</div>
							<div className="flex flex-row gap-2 items-center mb-6">
								<div className="bg-light-gray py-2 px-3 rounded">
									<FontAwesomeIcon icon={faLocationDot} />
								</div>
								<p>{event.location || "未設定"}</p>
							</div>
							<div className="flex flex-col gap-2 mb-6">
								<h2 className="text-l font-bold">イベントについて</h2>
								<p>{parse(formatDescription(event.description))}</p>
							</div>
							<div className="flex flex-col gap-2 mb-8">
								<h2 className="text-l font-bold">Share</h2>
								<TwitterShareButton
									url={`https://www.wasuta-archive.com/events/${id}`}
									title={event.title}
									hashtags={["わーすた", "わーすたアーカイブ"]}
									className="w-8"
								>
									<XIcon size={32} round={true} />
								</TwitterShareButton>
							</div>
							<div className="text-center">
								<BaseButton
									link={`/events/${id}/edit`}
									label="イベント情報を編集"
									white
								/>
							</div>
						</div>
						<div className="event-movie bg-100vw">
							<div className="container mx-auto p-6">
								<div className="flex justify-between items-center mb-2">
									<h3 className="text-xl font-bold text-font-color">
										イベントの動画
									</h3>
									<BaseButton label="もっと見る" link={`/events/${id}/movie`} />
								</div>
								<div
									style={{ marginRight: "calc(50% - 50vw)" }}
									className="movie-list min-h-60 flex items-center overflow-scroll mb-6"
								>
									{youtubeLinks.length > 0 ? (
										youtubeLinks.map((link) => (
											<div key={link.youtube_link_id} className="m-2">
												<MovieCard
													videoUrl={link.youtube_links.url}
													id={link.youtube_link_id}
												/>
											</div>
										))
									) : (
										<p>動画が登録されていません😢</p>
									)}{" "}
								</div>
								<div className="add-movie bg-white p-6 rounded-lg shadow-lg lg:w-[700px] mx-auto">
									<h4 className="text-xl font-bold text-deep-green mb-8">
										動画の登録
									</h4>
									<div className="flex flex-col gap-4 mx-auto">
										<div className="flex flex-col gap-2">
											<label htmlFor="url" className="text-sm font-bold">
												URL
											</label>
											<input
												id="url"
												type="url"
												value={url}
												onChange={(e) => setUrl(e.target.value)}
												className="mt-1 bg-light-gray py-3 px-4 block w-full border border-gray-200 rounded-lg"
											/>
										</div>
										<div className="flex flex-col gap-2">
											<label className="text-sm font-bold">タグ</label>
											<div className="flex flex-wrap gap-2 mb-8">
												{allYoutubeTags.map((tag) => (
													<Tag
														key={tag.id}
														label={tag.label}
														selected={selectedYoutubeTags.some(
															(t) => t.id === tag.id,
														)}
														onSelect={() => handleYoutubeTagSelect(tag)}
													/>
												))}
											</div>
										</div>
									</div>
									<div className="text-center">
										<BaseButton label="登録する" onClick={handleSubmit} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{loading && <LoadingSpinner />}
			</DefaultLayout>
		</>
	);
};

export default EventDetailsPage;
