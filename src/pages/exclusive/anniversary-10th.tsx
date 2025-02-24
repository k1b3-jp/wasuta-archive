import DefaultLayout from "@/app/layout";
import { NextSeo } from "next-seo";
import React, { useEffect, useState, useCallback } from "react";
import { getEvents } from "@/lib/supabase/getEvents";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import BaseButton from "@/components/ui/BaseButton";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";

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
}

// 型定義を追加
interface VideoItem {
	id: string;
	url: string;
}

const Anniversary10th = () => {
	const [events, setEvents] = useState<any[]>([]);
	const [images, setImages] = useState<EventImage[]>([]);
	const [sortByDate, setSortByDate] = useState(false);
	const [latestPastEventId, setLatestPastEventId] = useState<number | null>(
		null,
	);
	const today = new Date().toISOString().split("T")[0];
	const [isLoading, setIsLoading] = useState(true);
	const [backgroundImages, setBackgroundImages] = useState<EventImage[]>([]);
	const [bgScrollPosition, setBgScrollPosition] = useState(0);
	const [videoLoadCount, setVideoLoadCount] = useState(0);

	// 画面サイズに応じて必要な動画数を計算する関数
	const calculateTotalVideos = useCallback(() => {
		if (typeof window === "undefined") return 4; // SSR時のデフォルト値
		if (window.innerWidth >= 1024) return 9; // lg
		return 4; // sm, md
	}, []);

	const [totalVideos, setTotalVideos] = useState(calculateTotalVideos());

	// 画面サイズ変更時に動画数を更新
	useEffect(() => {
		const handleResize = () => {
			setTotalVideos(calculateTotalVideos());
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [calculateTotalVideos]);

	// YouTube IFrame APIの読み込み
	useEffect(() => {
		// APIスクリプトの読み込み
		const tag = document.createElement("script");
		tag.src = "https://www.youtube.com/iframe_api";
		const firstScriptTag = document.getElementsByTagName("script")[0];
		firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

		// APIの準備完了時のコールバック
		(window as any).onYouTubeIframeAPIReady = () => {
			setVideoLoadCount((prev) => prev + 1);
		};
	}, []);

	// 動画の読み込み状態を監視する関数
	const handleVideoReady = useCallback(() => {
		setVideoLoadCount((prev) => {
			const newCount = prev + 1;
			if (newCount >= totalVideos && events.length > 0) {
				setTimeout(() => {
					const loadingElement = document.querySelector(".loading-screen");
					loadingElement?.classList.add("animate-fade-out");

					setTimeout(() => {
						setIsLoading(false);
					}, 800);
				}, 1000);
			}
			return newCount;
		});
	}, [events.length, totalVideos]);

	// イベントデータの取得
	const fetchEvents = async () => {
		try {
			const eventsData = await getEvents({
				sortBy: "date",
				ascending: true,
			});
			setEvents(eventsData);

			// イベントデータから画像データを生成
			const imageData: EventImage[] = eventsData
				.filter((event) => event.image_url)
				.map((event) => ({
					id: event.event_id.toString(),
					url: event.image_url,
					alt: event.title || event.event_name || 'Event photo',
					width: 1600,
					height: 1200,
					title: event.title || event.event_name,
					date: new Date(event.date).toLocaleDateString("ja-JP", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
					rawDate: event.date,
					venue: event.location || "未設定",
					description: event.description,
				}));

			setImages(shuffleArray([...imageData]));
			setBackgroundImages(shuffleArray([...imageData]));

			// データ読み込み完了後、フェードアウト
			setTimeout(() => {
				const loadingElement = document.querySelector(".loading-screen");
				loadingElement?.classList.add("animate-fade-out");

				setTimeout(() => {
					setIsLoading(false);
				}, 800);
			}, 1000);
		} catch (err) {
			console.error(err);
			setIsLoading(false); // エラー時もローディングを終了
		}
	};

	// ソート順変更時の処理
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!images.length) return;

		let sortedImages: EventImage[];
		if (sortByDate) {
			sortedImages = [...images].sort(
				(a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime(),
			);
		} else {
			// 新しいシャッフルされた配列を作成
			sortedImages = shuffleArray([...images]);
		}

		setImages(sortedImages);
		// スクロール位置をリセット
		setScrollPosition(0);
		setBgScrollPosition(0);

		// スクロール位置を最上部に移動
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, [sortByDate]);

	// 配列をシャッフルする関数を修正
	const shuffleArray = <T,>(array: T[]): T[] => {
		return [...array].sort(() => Math.random() - 0.5);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchEvents();
	}, []);

	const [selectedImage, setSelectedImage] = useState<EventImage | null>(null);
	const [scrollPosition, setScrollPosition] = useState(0);
	const isMobile = useIsMobile();

	// Create a duplicated array of images for seamless looping
	const duplicatedImages = [...images, ...images];

	// スクロールアニメーションの処理
	useEffect(() => {
		// Dialogが開いているときはアニメーションを停止
		if (selectedImage) {
			return;
		}

		const interval = setInterval(() => {
			setScrollPosition((prev) => {
				const newPosition = prev + 2;
				// スクロール位置が画像の高さを超えたら0に戻す
				const imageHeight = 300; // 1枚の画像の高さ（px）
				const totalHeight = images.length * imageHeight;
				return newPosition >= totalHeight ? 0 : newPosition;
			});
		}, 25);

		return () => clearInterval(interval);
	}, [images, selectedImage]);

	// 背景用のスクロールアニメーション
	useEffect(() => {
		if (selectedImage) return;

		const interval = setInterval(() => {
			setBgScrollPosition((prev) => {
				const newPosition = prev + 1;
				const imageHeight = 300; // 1枚の画像の高さ（px）
				const totalHeight = backgroundImages.length * imageHeight;
				return newPosition >= totalHeight ? 0 : newPosition;
			});
		}, 25);

		return () => clearInterval(interval);
	}, [backgroundImages, selectedImage]);

	// 動画IDのリストを追加
	const videoIds = [
		"a3uKb1FknAU",
		"N-h_lgAWsiE",
		"5H4EfDri4OQ",
		"Itgm6jNIdTI",
		"89BE6NYaI1s",
		"vb_X5nr1-Qc",
		"B6szoHv_o2s",
		"bc1QaebMxZc",
		"bkrR0CgxwZY",
		"7ZZX2uLo3Xg",
		"5nQq9kvIRvU",
		"kHR-0PZI9t8",
		"L5wPVj3QyWM",
		"jzOQzCRa2cU",
		"a-P8qfhNq64",
		"yD7Xz8043x4",
		"_S5FvU2JxP0",
		"WPUcPDeDkZc",
		"dXT55zGpPEo",
		"bOviFZgJn9E",
		"wy4X7UOWRXI",
		"tOw1wC72wVw",
		"PCY82Arqsgs",
		"RdEzQlecBPA",
		"U_4vRd2Uef8",
		"m4Uv92LMeKU",
		"5g-8xkdCNyM",
		"SXG3N059ywY",
		"i2eiJJWBIhU",
		"B2oHJKQdHkM",
		"U8PH96BPpQM",
		"A6Nxxk9xCP8",
		"ojYMzvmJMck",
		"wq7D4wNXafA",
		"NjoayfiJBO8",
		"fNlcOsxxm10",
		"UEnPOCgUyQQ",
		"eLNQH92beRA",
		"FpPZp0bq2-o",
		"VL16K9t3Prs",
		"tHDNx_WE9gg",
		"W7whR4L4P6U",
		"XC0lvic0ARE",
		"rg3v1tSsNgw",
		"l3e-3MLxf6I",
		"FYepzthtpM0",
		"Am63abcoWw8",
		"G5AcWhaJzCY",
		"SrFzR6AcC2E",
		"W5kt7wvVpoo",
		"9J8OJiV1k7s",
		"5jMtROX6p6o",
		"CW_Bhzw_IqI",
		"qH7mffgS8gk",
		"mhpulQZMR-s",
		"_ex8PPpl-u4",
		"4ZcKBBo5DF0",
		"Ysvg83eY-50",
		"bvTwKWncHME",
		"xCBBk7z8muc",
		"TQMojC1f774",
		"Nzn_-VfBSeQ",
		"dCzq63g7wtM",
		"UGdUBSbc1Y8",
		"D0iu8VpTUTo",
		"r55f_RDjiwc",
		"sEEfRa7VNX8",
		"KY5LUduAj0E",
		"az51FK_eKG4",
		"XQtELQyvioU",
		"Mm2I-3eqfTQ",
		"dICksPYlIIk",
		"yS60HSMvyno",
		"vejxiCbio_k",
		"rodef9FQDF0",
		"-Q4OD-YuJQ4",
		"q0ZRAzbuheY",
		"6ed9pegAW5s",
		"JVFHAIYqfa8",
		"il01yJvKx0s",
		"QfSzMDESNgM",
		"Oa5MrW26FCs",
		"11yKCctu7AI",
		"MUDhbrFR2yU",
		"KVljyMCcuPM",
		"kSJsF3Zl_Iw",
		"kVMgYTeVk9Y",
		"edjp8iylfPI",
		"xx9E-drxprs",
		"ZzrOLkDK1kM",
		"JhvrJ7y9foE",
		"l_rrBHR5iUs",
		"ZpEWGLMD-BY",
		"24WFVmFsIeU",
		"ze97B94nrVY",
		"tOswgrDp404",
		"iZD9a6PWmaw",
		"MM-enoUnz2w",
		"baA5GDFTINw",
	];

	// ランダムな動画IDを選択する状態を追加
	const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

	// コンポーネントマウント時にランダムな動画を選択
	useEffect(() => {
		// 動画IDをシャッフル
		const shuffled = [...videoIds].sort(() => Math.random() - 0.5);
		// 最初の20個を選択（パフォーマンスのため）
		setSelectedVideoIds(shuffled.slice(0, 20));
	}, []);

	// gridVideoIdsの型を修正
	const [gridVideoIds, setGridVideoIds] = useState<VideoItem[][]>([]);

	// 動画の開始位置をランダムに生成する関数
	const generateRandomStart = useCallback(() => {
		return Math.floor(Math.random() * 180);
	}, []);

	// 動画URLを生成する関数
	const generateVideoUrl = useCallback(
		(videoId: string) => {
			const startTime = generateRandomStart();
			return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&showinfo=0&modestbranding=1&start=${startTime}&enablejsapi=1`;
		},
		[generateRandomStart],
	);

	// グリッド用の動画配列を生成
	useEffect(() => {
		const shuffled = [...videoIds].sort(() => Math.random() - 0.5);
		const selected = shuffled.slice(0, totalVideos);
		const grid = [];
		const cols = totalVideos === 9 ? 3 : 2;
		for (let i = 0; i < selected.length; i += cols) {
			grid.push(
				selected.slice(i, i + cols).map((id) => ({
					id,
					url: generateVideoUrl(id),
				})),
			);
		}
		setGridVideoIds(grid);
	}, [totalVideos, generateVideoUrl]);

	// imagesの定義を削除（useState で管理するため）

	// ローディング画面を簡略化
	if (isLoading) {
		return (
			<DefaultLayout>
				<div className="fixed inset-0 bg-white z-50 flex items-center justify-center loading-screen">
					<div className="text-center animate-fade-in">
						<div className="inline-flex items-center justify-center gap-3 mb-6">
							<div className="h-[1px] w-12 bg-gray-400" />
							<span className="text-lg font-medium text-gray-600">
								2015 - 2025
							</span>
							<div className="h-[1px] w-12 bg-gray-400" />
						</div>
						<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
							わーすた10周年記念特設ページ
						</h1>
						<p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base mb-8">
							10年間の思い出と感動を、写真とともに。
						</p>
						<div className="flex justify-center">
							<Loader2 className="w-6 h-6 animate-spin text-gray-600" />
						</div>
					</div>
				</div>
			</DefaultLayout>
		);
	}

	// メインコンテンツから重複するタイトル部分を削除
	return (
		<>
			<NextSeo
				title="わーすた10周年記念特設ページ"
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
			<DefaultLayout hideBottomNav>
				{/* ScrollToTopButtonを追加 */}
				<ScrollToTopButton />

				{/* 背景レイヤー */}
				<div className="fixed inset-0 overflow-hidden bg-black">
					<div className="absolute inset-0 w-full h-full">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-screen w-screen">
							{gridVideoIds.map((row, rowIndex) =>
								row.map((video) => (
									<div
										key={video.id}
										className="relative w-full h-full overflow-hidden"
									>
										<div className="absolute inset-0">
											<iframe
												src={video.url}
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												className="absolute w-[200%] h-[200%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
												style={{
													pointerEvents: "none",
													objectFit: "cover",
													minWidth: "200%",
													minHeight: "200%",
												}}
												title={`わーすた Background Video ${rowIndex}-${video.id}`}
												loading="lazy"
												frameBorder="0"
											/>
										</div>
									</div>
								)),
							)}
						</div>
					</div>
					{/* オーバーレイ - 透明度を調整 */}
					<div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
				</div>

				{/* メインコンテンツ */}
				<main className="relative z-10 bg-transparent pb-10 pl-4 bg-100vw">
					<div className="min-h-screen bg-gallery-bg px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
						<div className="mx-auto px-4 sm:px-8 lg:px-12">
							<div className="text-center mb-16 opacity-0 animate-fade-in">
								<div className="inline-flex items-center justify-center gap-3 mb-6">
									<div className="h-[1px] w-12 bg-gray-400" />
									<span className="text-lg font-medium text-gray-600">
										2015 - 2025
									</span>
									<div className="h-[1px] w-12 bg-gray-400" />
								</div>
								<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
									わーすたの歩み
								</h1>
								<p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
									10年間の思い出と感動を、写真とともに振り返ります
								</p>
							</div>

							{/* ソートボタンを固定表示 */}
							<div className="fixed top-6 right-6 z-20">
								<button
									type="button"
									onClick={() => setSortByDate(!sortByDate)}
									className={cn(
										"flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors shadow-lg",
										sortByDate
											? "bg-black text-white"
											: "bg-white text-gray-700 hover:bg-gray-50",
										"backdrop-blur-sm",
									)}
								>
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										aria-labelledby="sortIconTitle"
									>
										<title id="sortIconTitle">ソートアイコン</title>
										{sortByDate ? (
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										) : (
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
											/>
										)}
									</svg>
									{sortByDate ? "日付順" : "ランダム"}
								</button>
							</div>

							<div
								className={cn(
									"grid gap-8 md:gap-16",
									"relative overflow-hidden -mt-14 pt-14",
									isMobile
										? "grid-cols-2"
										: [
											"grid-cols-3",
											"lg:grid-cols-3",
											"xl:grid-cols-3",
											"2xl:grid-cols-4",
											"3xl:grid-cols-5",
										].join(" "),
								)}
								style={{
									transform: images.length > 0 && !selectedImage
										? `translateY(-${scrollPosition}px)`
										: "none",
									transition: "transform 0.5s ease-out",
									maxWidth: "100%",
									margin: "0 auto",
									padding: "0 1px",
								}}
							>
								{duplicatedImages.map((image) => (
									<button
										type="button"
										key={`${image.id}-${image.url}`}
										className={cn(
											"group relative cursor-pointer overflow-hidden bg-gallery-card transition-transform duration-300",
											"w-full aspect-[4/3]",
										)}
										onClick={() => setSelectedImage(image)}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												setSelectedImage(image);
											}
										}}
									>
										<div className="relative h-full w-full">
											<img
												src={`${image.url}?auto=format&fit=crop&w=1600&h=1200&q=80`}
												alt={image.alt}
												loading="lazy"
												onError={(e) => {
													console.error(
														`画像の読み込みに失敗しました: ${image.url}`,
													);
													e.currentTarget.style.display = "none";
												}}
												className={cn(
													"h-full w-full object-cover",
													"transition-transform duration-300",
													"group-hover:scale-110",
												)}
											/>
											<div
												className={cn(
													"absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent",
													"opacity-0 group-hover:opacity-100",
													"transition-opacity duration-300",
													"flex items-end p-4",
												)}
											>
												<div className="text-white text-base font-medium truncate w-full">
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
								<DialogContent
									className={cn(
										"animate-modal-in bg-white p-0",
										"w-[80%] lg:w-[40%]",
										"max-w-[1200px]",
										"mx-auto",
										"[&>button]:w-8 [&>button]:h-8",
										"[&>button]:hover:bg-white",
										"[&>button]:flex [&>button]:items-center [&>button]:justify-center",
										"[&>button]:top-6 [&>button]:right-6",
									)}
								>
									{selectedImage && (
										<>
											<div className="event-head bg-light-gray p-4">
												<div className="aspect-[4/3] relative overflow-hidden">
													<img
														src={selectedImage.url}
														alt={selectedImage.alt}
														className="w-full h-full object-contain"
													/>
												</div>
											</div>
											<div className="event-detail p-6">
												<h1 className="text-font-color font-bold text-xl mb-4">
													{selectedImage.alt}
												</h1>
												<div className="flex flex-row gap-2 items-center mb-4">
													<div className="bg-light-gray py-2 px-3 rounded">
														<svg
															className="w-5 h-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															aria-labelledby="calendarIconTitle"
														>
															<title id="calendarIconTitle">カレンダーアイコン</title>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
															/>
														</svg>
													</div>
													<p>{selectedImage.date}</p>
												</div>
												<div className="flex flex-row gap-2 items-center mb-6">
													<div className="bg-light-gray py-2 px-3 rounded">
														<svg
															className="w-5 h-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															aria-labelledby="locationIconTitle"
														>
															<title id="locationIconTitle">場所アイコン</title>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
															/>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
															/>
														</svg>
													</div>
													<p>{selectedImage.venue}</p>
												</div>
												{selectedImage.description && (
													<div className="flex flex-col gap-2 mb-6">
														<h2 className="text-l font-bold">
															イベントについて
														</h2>
														<p className="whitespace-pre-wrap">
															{selectedImage.description}
														</p>
													</div>
												)}

												{/* 遷移ボタンを追加 */}
												<div className="mt-6 text-center">
													<Link
														href={`/events/${selectedImage.id}`}
														rel="noopener noreferrer"
														target="_blank"
														className="inline-flex items-center justify-center"
													>
														<BaseButton label="イベント詳細を見る" />
													</Link>
												</div>
											</div>
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

export default Anniversary10th;
