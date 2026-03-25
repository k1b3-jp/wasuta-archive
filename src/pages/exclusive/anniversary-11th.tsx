import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "next-seo";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getEvents } from "@/lib/supabase/getEvents";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { ArrowDown, Play, Calendar, Video, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import BaseButton from "@/components/ui/BaseButton";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import WorldMap from "@/components/events/WorldMap";

interface Image {
	id: string;
	url: string;
	alt: string;
	width: number;
	height: number;
}

interface EventImage extends Image {
	id: string;
	url: string;
	alt: string;
	width: number;
	height: number;
	title: string;
	date: string;
	venue: string;
	description?: string;
	rawDate: string;
	isAnniversary?: boolean;
	uniqueKey?: string;
}

interface YouTubeWindow extends Window {
	YT?: any;
	onYouTubeIframeAPIReady?: (() => void) | undefined;
}

interface VideoItem {
	id: string;
	url: string;
}

interface Stats {
	events: number;
	movies: number;
	days: number;
}

interface Movie {
	youtube_link_id: number;
	url: string;
	title?: string;
}

const Anniversary11th = () => {
	const [images, setImages] = useState<EventImage[]>([]);
	const [allEvents, setAllEvents] = useState<any[]>([]);
	const [venues, setVenues] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [videoLoadCount, setVideoLoadCount] = useState(0);

	const [stats, setStats] = useState<Stats>({ events: 0, movies: 0, days: 0 });
	const [movie, setMovie] = useState<Movie | null>(null);

	const fetchRandomMovie = useCallback(async (totalCount: number) => {
		if (totalCount <= 0) return;
		try {
			const randomLimit = Math.floor(Math.random() * totalCount);
			const { data: randomMovie } = await supabase
				.from("youtube_links").select("youtube_link_id, url")
				.range(randomLimit, randomLimit).limit(1);

			if (randomMovie && randomMovie.length > 0) {
				setMovie(randomMovie[0]);
			}
		} catch (error) {
			console.error("Error fetching random movie:", error);
		}
	}, []);

	// 動画IDのリスト（背景用）
	const videoIds = [
		"a3uKb1FknAU", "N-h_lgAWsiE", "5H4EfDri4OQ", "Itgm6jNIdTI", "89BE6NYaI1s",
		"vb_X5nr1-Qc", "B6szoHv_o2s", "bc1QaebMxZc", "bkrR0CgxwZY", "7ZZX2uLo3Xg",
		"5nQq9kvIRvU", "kHR-0PZI9t8", "L5wPVj3QyWM", "jzOQzCRa2cU", "a-P8qfhNq64",
		"yD7Xz8043x4", "_S5FvU2JxP0", "WPUcPDeDkZc", "dXT55zGpPEo", "bOviFZgJn9E",
		"wy4X7UOWRXI", "tOw1wC72wVw", "PCY82Arqsgs", "RdEzQlecBPA", "U_4vRd2Uef8",
	];

	const calculateTotalVideos = useCallback(() => {
		if (typeof window === "undefined") return 2;
		if (window.innerWidth >= 1024) return 9;
		return 2;
	}, []);

	const [totalVideos, setTotalVideos] = useState(calculateTotalVideos());

	useEffect(() => {
		const handleResize = () => setTotalVideos(calculateTotalVideos());
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [calculateTotalVideos]);

	// YouTube IFrame APIの読み込み
	useEffect(() => {
		const win = window as YouTubeWindow;
		if (win.YT) {
			setVideoLoadCount((prev) => prev + 1);
			return;
		}
		const ytReadyHandler = () => setVideoLoadCount((prev) => prev + 1);

		if (!win.onYouTubeIframeAPIReady) {
			const tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			const firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
			win.onYouTubeIframeAPIReady = ytReadyHandler;
		}
		return () => {
			if (win.onYouTubeIframeAPIReady === ytReadyHandler) {
				win.onYouTubeIframeAPIReady = undefined;
			}
		};
	}, []);

	const handleVideoReady = useCallback(() => {
		setVideoLoadCount((prev) => {
			const newCount = prev + 1;
			if (newCount >= totalVideos && images.length > 0) {
				setTimeout(() => {
					const loadingElement = document.querySelector(".loading-screen");
					loadingElement?.classList.add("animate-fade-out");
					setTimeout(() => setIsLoading(false), 800);
				}, 1000);
			}
			return newCount;
		});
	}, [images.length, totalVideos]);

	// データ取得ロジック
	const fetchData = useCallback(async () => {
		try {
			// 1. Stats Calculation
			const formationDate = new Date("2015-03-29");
			const anniversaryDate = new Date("2026-03-29");
			const daysSince = Math.floor((anniversaryDate.getTime() - formationDate.getTime()) / (1000 * 60 * 60 * 24));

			const { count: eventsCount } = await supabase.from("events").select("*", { count: "exact", head: true });
			const { count: moviesCount } = await supabase.from("youtube_links").select("*", { count: "exact", head: true });

			setStats({ events: eventsCount || 0, movies: moviesCount || 0, days: daysSince });

			// 2. Fetch specific movies
			if (moviesCount) {
				await fetchRandomMovie(moviesCount);
			}

			// 3. Fetch Events chronologically (History mode)
			const eventsData = await getEvents({ sortBy: "date", ascending: true });
			setAllEvents(eventsData);

			// 4. Fetch Venues (World Map)
			const { data: venuesData } = await supabase.from("venues").select("*");
			if (venuesData) setVenues(venuesData);

			const imageData: EventImage[] = eventsData
				.filter((event) => event.image_url)
				.map((event) => ({
					id: event.event_id.toString(),
					url: event.image_url,
					alt: event.title || event.event_name || 'Event photo',
					width: 800,
					height: 600,
					title: event.title || event.event_name,
					date: new Date(event.date).toLocaleDateString("ja-JP", {
						year: "numeric", month: "long", day: "numeric",
					}),
					rawDate: event.date,
					venue: event.location || "未設定",
					description: event.description,
				}));

			// 11周年はシャッフルせず時系列で表示（年表の役割を兼ねる）
			setImages([...imageData]);

			if (isLoading) {
				setTimeout(() => {
					const loadingElement = document.querySelector(".loading-screen");
					loadingElement?.classList.add("animate-fade-out");
					setTimeout(() => setIsLoading(false), 800);
				}, 1000);
			}
		} catch (err) {
			console.error(err);
			setIsLoading(false);
		}
	}, [isLoading]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const [selectedImage, setSelectedImage] = useState<EventImage | null>(null);
	const isMobile = useIsMobile();

	const duplicatedImages = useMemo(() =>
		[...images].map((image, index) => ({
			...image,
			uniqueKey: `${image.id}-${index}`,
			isAnniversary: (image.title || "").includes("周年") || (image.title || "").toLowerCase().includes("anniversary")
		})),
		[images]);

	const [gridVideoIds, setGridVideoIds] = useState<VideoItem[][]>([]);

	const generateRandomStart = useCallback(() => Math.floor(Math.random() * 180), []);

	const generateVideoUrl = useCallback((videoId: string) => {
		const startTime = generateRandomStart();
		const quality = window.innerWidth >= 1024 ? 'medium' : 'small';
		return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&showinfo=0&modestbranding=1&start=${startTime}&enablejsapi=1&vq=${quality}&cookie_policy=none`;
	}, [generateRandomStart]);

	useEffect(() => {
		const actualTotalVideos = Math.min(totalVideos, 6);
		const shuffled = [...videoIds].sort(() => Math.random() - 0.5);
		const selected = shuffled.slice(0, actualTotalVideos);
		const grid: VideoItem[][] = [];
		const cols = actualTotalVideos > 4 ? 3 : 2;
		for (let i = 0; i < selected.length; i += cols) {
			grid.push(
				selected.slice(i, i + cols).map((id) => ({
					id, url: generateVideoUrl(id),
				})),
			);
		}
		setGridVideoIds(grid);
	}, [totalVideos, generateVideoUrl]);

	const getYoutubeId = (url: string) => {
		const match = url?.match(/[?&]v=([^&]+)/);
		return match ? match[1] : url?.split('/').pop();
	};

	if (isLoading) {
		return (
			<DefaultLayout>
				<div className="fixed inset-0 bg-white z-50 flex items-center justify-center loading-screen">
					<div className="text-center">
						<div className="inline-flex items-center justify-center gap-3 mb-6">
							<div className="clock-wrapper">
								<div className="clock">
									<div className="clock-face">
										<div className="hand hour-hand" />
										<div className="hand minute-hand" />
										<div className="center-dot" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DefaultLayout>
		);
	}

	return (
		<>
			<NextSeo
				title="わーすた結成11周年特設ページ - 4018日の物語"
				openGraph={{
					images: [{ url: process.env.defaultOgpImage || "", width: 1200, height: 630, alt: "Og Image Alt" }],
				}}
			/>
			<DefaultLayout hideBottomNav>
				<ScrollToTopButton />

				{/* 背景ビデオレイヤー */}
				<div className="fixed inset-0 overflow-hidden bg-black">
					<div className="absolute inset-0 w-full h-full">
						<div className="grid grid-cols-1 lg:grid-cols-3 h-screen w-screen">
							{gridVideoIds.map((row, rowIndex) =>
								row.map((video, colIndex) => (
									<div key={`${video.id}-${rowIndex}-${colIndex}`} className="relative w-full h-full overflow-hidden">
										<div className="absolute inset-0">
											<iframe
												src={video.url}
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												className="absolute w-[200%] h-[210%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
												style={{ pointerEvents: "none", objectFit: "cover", minWidth: "200%", minHeight: "200%" }}
												title={`わーすた Background Video ${rowIndex}-${colIndex}`}
												loading="lazy" frameBorder="0" data-cookieconsent="ignore"
												onLoad={handleVideoReady}
											/>
										</div>
									</div>
								))
							)}
						</div>
					</div>
					<div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
				</div>

				{/* メインコンテンツ */}
				<main className="relative z-10 bg-transparent pb-10 bg-100vw">
					<div className="min-h-screen px-4 sm:px-6 lg:px-8">

						{/* メッセージ＆統計セクション */}
						<div className="relative z-20 bg-white shadow-xl zen-kurenaido-regular rounded-b-[40px] md:rounded-b-[60px] mb-14 overflow-hidden">
							<div className="py-20 md:py-28">
								<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
									<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-wider">
										11th Anniversary
									</h2>
									<p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-16 font-handwriting">
										11年、<span className="text-3xl font-bold text-deep-green mx-1">{stats.days}</span>日。<br />
										私たちが追いかけた軌跡の数だけ、たくさんの思い出がある。<br />
										<br />
										結成から今日まで、<br />
										数え切れないほどの輝く瞬間を目に焼き付けてきました。<br />
										<br />
										振り返れば、そこにはいつも<br />
										わーすたちゃんの笑顔がありました。<br />
										<br />
										ここにあるのは、そんなわーしっぷから見た大切な記憶の欠片たちです。<br />
										11周年おめでとう。これからもずっと応援しています！<br />
									</p>

									{/* 統計パネル */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
										<div className="bg-light-gray/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
											<Clock className="w-8 h-8 text-primary mb-3" />
											<div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">歴史の長さ</div>
											<div className="text-3xl font-extrabold text-gray-800">{stats.days} <span className="text-sm text-gray-500 font-medium">days</span></div>
										</div>
										<div className="bg-light-gray/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
											<Calendar className="w-8 h-8 text-primary mb-3" />
											<div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">総登録イベント数</div>
											<div className="text-3xl font-extrabold text-gray-800">{stats.events} <span className="text-sm text-gray-500 font-medium">events</span></div>
										</div>
										<div className="bg-light-gray/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
											<Video className="w-8 h-8 text-primary mb-3" />
											<div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">公開中動画数</div>
											<div className="text-3xl font-extrabold text-gray-800">{stats.movies} <span className="text-sm text-gray-500 font-medium">movies</span></div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* ランダム動画セクション */}
						<div className="relative z-20 max-w-3xl mx-auto mb-20 px-4">
							<div className="bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-white/30 transform origin-center transition-transform hover:scale-[1.02]">
								<button
									type="button"
									onClick={() => fetchRandomMovie(stats.movies)}
									className="w-full bg-primary hover:bg-primary/90 transition-colors text-white py-3 px-4 text-center font-bold text-sm md:text-base flex justify-center items-center gap-2 cursor-pointer group"
									title="クリックで別のランダム動画を再生します"
								>
									<RefreshCw className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-300" /> 11年間のどこかの日にタイムスリップ
								</button>
								<div className="aspect-video bg-black relative">
									{movie && <iframe src={`https://www.youtube.com/embed/${getYoutubeId(movie.url)}`} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen></iframe>}
								</div>
							</div>
						</div>

						{/* World Tour Section */}
						<div className="relative z-20 max-w-5xl mx-auto mb-24 px-4 overflow-hidden">
							<h3 className="text-center text-white/90 font-bold mb-10 text-2xl md:text-3xl tracking-widest font-handwriting leading-loose">
								— Our Journey —<br />
								<span className="text-sm font-sans tracking-widest opacity-80 uppercase">The World Standard</span>
							</h3>
							<WorldMap events={allEvents} venues={venues} />
						</div>

						{/* 時系列による写真のフルスクロール（旧：写真スライドグリッド） */}
						<div className="relative z-10 mx-auto px-4 sm:px-8 lg:px-12 pb-20">
							<div className="flex justify-center mb-10">
								<ArrowDown className="w-8 h-8 animate-bounce text-white/50" />
							</div>
							<h3 className="text-center text-white/80 font-bold mb-10 text-xl tracking-widest font-handwriting">
								— History Line —<br />2015 to Present
							</h3>

							<div className={cn(
								"grid gap-6 md:gap-8 lg:gap-10",
								isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
							)}>
								{duplicatedImages.map((image) => (
									<button
										type="button"
										key={image.uniqueKey}
										className="group relative cursor-pointer overflow-hidden bg-black/40 rounded-lg shadow-xl border border-white/10 transition-transform duration-300 w-full aspect-[4/3] hover:-translate-y-2 hover:shadow-2xl hover:border-white/30"
										onClick={() => setSelectedImage(image)}
									>
										{/* マイルストーンバッジ */}
										{image.isAnniversary && (
											<div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
												★ Anniv.
											</div>
										)}
										<div className="relative h-full w-full">
											<img
												src={`${image.url}?auto=format&fit=crop&w=800&h=600&q=80`}
												alt={image.alt}
												loading="lazy"
												onError={(e) => { e.currentTarget.style.display = "none"; }}
												className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
												<div className="text-white/70 text-[10px] md:text-xs font-mono mb-1">
													{image.date}
												</div>
												<div className="text-white text-xs md:text-sm font-bold leading-tight break-words line-clamp-2 shadow-sm">
													{image.title}
												</div>
											</div>
										</div>
									</button>
								))}
							</div>

							<Dialog
								open={!!selectedImage}
								onOpenChange={() => setSelectedImage(null)}
							>
								<DialogContent className="animate-modal-in bg-white p-0 w-[85%] lg:w-[45%] max-w-[800px] mx-auto overflow-hidden rounded-2xl [&>button]:top-4 [&>button]:right-4 [&>button]:bg-white/50 [&>button]:hover:bg-white [&>button]:rounded-full [&>button]:w-8 [&>button]:h-8">
									{selectedImage && (
										<>
											<DialogTitle className="sr-only">
												{selectedImage.title || 'イベント詳細'}
											</DialogTitle>
											<DialogDescription asChild>
												<div>
													<div className="bg-black">
														<div className="aspect-[16/9] relative overflow-hidden flex items-center justify-center">
															<img
																src={selectedImage.url}
																alt={selectedImage.alt}
																className="w-full h-full object-contain"
															/>
														</div>
													</div>
													<div className="p-6 md:p-8 bg-gallery-bg">
														<div className="flex items-center gap-3 mb-3">
															<span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
																{selectedImage.date}
															</span>
															{selectedImage.isAnniversary && (
																<span className="bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
																	Anniversary
																</span>
															)}
														</div>
														<h1 className="text-font-color font-extrabold text-xl md:text-2xl mb-6 leading-tight">
															{selectedImage.alt}
														</h1>

														<div className="flex items-start gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
															<svg className="w-6 h-6 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
															<div>
																<div className="text-xs text-gray-500 font-bold mb-1">LOCATION</div>
																<p className="font-medium text-gray-800">{selectedImage.venue}</p>
															</div>
														</div>

														{selectedImage.description && (
															<div className="mb-8">
																<h2 className="text-sm font-bold text-gray-500 mb-2 border-b pb-2">イベント詳細</h2>
																<p className="whitespace-pre-wrap text-gray-700 text-sm md:text-base leading-relaxed">
																	{selectedImage.description}
																</p>
															</div>
														)}

														<div className="text-center pt-4">
															<Link href={`/events/${selectedImage.id}`} rel="noopener noreferrer" target="_blank">
																<BaseButton label="イベントページへ" />
															</Link>
														</div>
													</div>
												</div>
											</DialogDescription>
										</>
									)}
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</main>
			</DefaultLayout>
		</>
	);
};

export default Anniversary11th;
