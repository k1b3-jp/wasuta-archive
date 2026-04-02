import DefaultLayout from "@/components/layout/DefaultLayout";
import EventCard from "@/components/events/EventCard";
import MovieCard from "@/components/events/MovieCard";
import TopFeaturedEventCard from "@/components/events/TopFeaturedEventCard";
import BaseButton from "@/components/ui/BaseButton";
import CategoryCard from "@/components/ui/CategoryCard";
import { getEvents } from "@/lib/supabase/getEvents";
import { getMovies } from "@/lib/supabase/getMovies";
import type { Event } from "@/types/event";
import type { Movie } from "@/types/movie";
import {
	faCakeCandles,
	faHandshakeSimple,
	faSun,
	faTicket,
} from "@fortawesome/free-solid-svg-icons";
import { NextSeo, WebPageJsonLd } from "next-seo";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Autoplay } from "swiper/modules";
import Link from "next/link";

interface HomeProps {
	featuredEvents: Event[];
	events: Event[];
	movies: Movie[];
}

export async function getServerSideProps() {
	let featuredEvents: Event[] = [];
	let events: Event[] = [];
	let movies: Movie[] = [];

	try {
		featuredEvents = await getEvents({
			limit: 6,
			tags: [1, 4],
			byToday: true,
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error fetching featured events: ${error.message}`);
		}
	}

	try {
		events = await getEvents({
			limit: 6,
			byToday: true,
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error fetching events: ${error.message}`);
		}
	}

	try {
		// イベントに紐づくYouTubeリンクを取得
		movies = await getMovies({
			limit: 6,
			ascending: false,
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error fetching movies: ${error.message}`);
		}
	}

	return {
		props: {
			featuredEvents,
			events,
			movies,
		},
	};
}

const HomePage: React.FC<HomeProps> = ({ featuredEvents, events, movies }) => {
	return (
		<>
			<NextSeo
				title="わーすたアーカイブ"
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
			<WebPageJsonLd
				description="わーすたアーカイブはわーすたの動画がイベント毎に見つかるサイトです。タグで過去のライブを探したり、年表表示で歴史を振り返ることができます。"
				id="https://www.wasuta-archive.com/"
			/>
			<DefaultLayout>
				<div>
					<section className="bg-100vw">
						<div className="relative w-full">
							<Swiper
								modules={[Navigation, Autoplay]}
								spaceBetween={10}
								breakpoints={{
									320: {
										slidesPerView: 1.2,
										spaceBetween: 10,
									},
									640: {
										slidesPerView: 1.5,
										spaceBetween: 20,
									},
									768: {
										slidesPerView: 1.8,
										spaceBetween: 30,
									},
									1280: {
										slidesPerView: 2.5,
										spaceBetween: 40,
									},
								}}
								centeredSlides
								loop={true}
								navigation
								autoplay={{
									delay: 5000,
									disableOnInteraction: false,
								}}
							>
								{featuredEvents.map((event) => (
									<SwiperSlide key={event.event_id}>
										<TopFeaturedEventCard
											key={event.event_id}
											id={event.event_id}
											title={event.event_name}
											date={event.date}
											location={event.location}
											imageUrl={event.image_url}
										/>
									</SwiperSlide>
								))}
							</Swiper>
						</div>
					</section>
					{/* 11周年アニバーサリー特設バナー */}
					<section className="w-full my-4">
						<div className="container mx-auto px-4 md:px-0">
							<Link href="/exclusive/anniversary-11th" className="block relative overflow-hidden rounded-xl md:rounded-2xl shadow-md hover:shadow-lg border border-white/20 group transition-all duration-300 hover:-translate-y-1">
								<div className="bg-gradient-to-br from-[#f2a2c8] via-[#c6a2f2] to-[#7ec8d9] w-full p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative">
									<div className="text-white text-center md:text-left z-10 flex-1">
										<div className="inline-block bg-white/20 backdrop-blur-md rounded px-2 py-0.5 mb-1.5 text-[10px] font-bold tracking-widest border border-white/30">SPECIAL PRESENT</div>
										<h2 className="text-lg md:text-xl font-extrabold mb-1 tracking-wider drop-shadow-sm flex items-center justify-center md:justify-start gap-2">
											わーすた結成11周年記念🎯 <span className="hidden md:inline text-sm font-handwriting opacity-90 font-medium">4018日の軌跡を辿る。特設ページ公開中！</span>
										</h2>
										<p className="md:hidden text-xs font-bold opacity-90 drop-shadow mt-1 font-handwriting tracking-wide">
											4018日の軌跡を辿る。特設ページ公開中！
										</p>
									</div>
									<div className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full font-bold text-xs border border-white/50 shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:bg-white group-hover:text-pink-500 transition-colors whitespace-nowrap z-10">
										特設ページへ
									</div>
									
									{/* 装飾用背景エフェクト */}
									<div className="absolute right-0 top-0 w-48 h-48 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
								</div>
							</Link>
						</div>
					</section>
					<section className="flex flex-col bg-gradient-to-r from-[#f2a2c8]/10 to-[#7ec8d9]/10 bg-100vw">
						<div className="container mx-auto p-6">
							<h3 className="text-xl font-bold text-font-color mb-6">
								カテゴリ
							</h3>
							<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
								<CategoryCard
									href="/events?tags=1"
									src={faTicket}
									title="単独ライブ"
									description="わーすたが主催するライブイベント"
								/>
								<CategoryCard
									href="/events?tags=2"
									src={faSun}
									title="対バン"
									description="出演した対バンやフェス"
								/>
								<CategoryCard
									href="/events?tags=3"
									src={faHandshakeSimple}
									title="リリイベ"
									description="CDリリースに際したイベント"
								/>
								<CategoryCard
									href="/events?tags=4"
									src={faCakeCandles}
									title="生誕"
									description="各メンバーの生誕イベント"
								/>
							</div>
						</div>
					</section>
					<section className="bg-100vw">
						<div className="container mx-auto p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-xl font-bold text-font-color">新着動画</h3>
								<BaseButton label="もっと見る" link="/movies" />
							</div>
							<div
								style={{ marginRight: "calc(50% - 50vw)" }}
								className="movie-list min-h-60 flex items-center overflow-scroll"
							>
								{movies.length > 0 ? (
									movies.map((link) => (
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
						</div>
					</section>
					<section className="">
						<div className="container mx-auto p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-xl font-bold text-font-color">
									新着イベント
								</h3>
								<BaseButton label="もっと見る" link="/events" />
							</div>
							<div className="grid-base py-4">
								{events?.map((event) => (
									<EventCard
										key={event.event_id}
										title={event.event_name}
										location={event.location}
										date={event.date}
										imageUrl={event.image_url}
										id={event.event_id}
									/>
								))}
							</div>
							<div className="my-6 px-6 lg:mx-auto text-center">
								<BaseButton label="もっと見る" link="/events" white />
							</div>
						</div>
					</section>
				</div>
			</DefaultLayout>
		</>
	);
};

export default HomePage;
