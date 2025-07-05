import DefaultLayout from "@/app/layout";
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
import Ad from "@/components/ui/Ad";

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
					<section className="bg-white px-5 pb-4">
						<Ad adMaxId="64bb21244d4a4a811bdc9950be293b25" />
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
