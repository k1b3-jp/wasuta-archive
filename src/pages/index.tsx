import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import {
	faArrowRight,
	faCalendarDays,
	faMusic,
	faShirt,
	faTimeline,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import type { CSSProperties } from "react";
import { extractYouTubeVideoId } from "@/components/events/MovieCard";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo, WebPageJsonLd } from "@/components/seo";
import { getEvents } from "@/lib/supabase/getEvents";
import { getMovies } from "@/lib/supabase/getMovies";
import type { Event } from "@/types/event";
import type { Movie } from "@/types/movie";
import formatDate from "@/utils/formatDate";
import styles from "./index.module.scss";

interface HomeProps {
	featuredEvents: Event[];
	events: Event[];
	movies: Movie[];
}

const archiveDoors = [
	{
		label: "EVENTS",
		title: "イベント",
		copy: "ライブ、ツアー、記念日。あの日の場所から記憶をたどる。",
		href: "/events",
		icon: faCalendarDays,
		color: "#7ec8d9",
	},
	{
		label: "MOVIES",
		title: "動画",
		copy: "ステージと舞台裏。残された映像をイベントと一緒に観る。",
		href: "/movies",
		icon: faYoutube,
		color: "#fbcc7e",
	},
	{
		label: "SONGS",
		title: "楽曲",
		copy: "リリースと初披露。楽曲が生まれた瞬間へ戻る。",
		href: "/songs",
		icon: faMusic,
		color: "#f2a2c8",
	},
	{
		label: "COSTUMES",
		title: "衣装",
		copy: "色、形、ステージ。衣装とパフォーマンスの関係を見る。",
		href: "/costumes",
		icon: faShirt,
		color: "#c6a4c6",
	},
] as const;

export async function getServerSideProps() {
	let featuredEvents: Event[] = [];
	let events: Event[] = [];
	let movies: Movie[] = [];

	try {
		[featuredEvents, events, movies] = await Promise.all([
			getEvents({ limit: 1, tags: [1, 4], byToday: true }),
			getEvents({ limit: 6, byToday: true }),
			getMovies({ limit: 6, ascending: false }),
		]);
	} catch (error) {
		console.error("Home archive data could not be loaded", error);
	}

	return { props: { featuredEvents, events, movies } };
}

export default function HomePage({
	featuredEvents,
	events,
	movies,
}: HomeProps) {
	const heroEvent = featuredEvents[0] || events[0];

	return (
		<>
			<NextSeo title="わーすたアーカイブ" />
			<WebPageJsonLd
				description="イベント、動画、楽曲、衣装をつなぎ、わーすたの歩みを未来へ残す公開アーカイブ。"
				id="https://www.wasuta-archive.com/"
			/>
			<DefaultLayout>
				<div className={`${styles.page} bg-100vw`}>
					<section className={styles.hero}>
						{heroEvent?.image_url && (
							<img
								className={styles.heroImage}
								src={heroEvent.image_url}
								alt=""
							/>
						)}
						<div className={styles.heroShade} />
						<div className={styles.heroContent}>
							<p className={styles.kicker}>
								THE WORLD STANDARD ARCHIVE · 2015—2026
							</p>
							<h1>
								わーすたの時間を、
								<br />
								<span>未来へ。</span>
							</h1>
							<p className={styles.heroCopy}>
								イベント、動画、楽曲、衣装。散らばっていた記録をつないで、あの頃の景色にもう一度会いにいく。
							</p>
							<div className={styles.heroActions}>
								<Link
									className={styles.primaryAction}
									href="/timeline?year=2022"
								>
									<FontAwesomeIcon icon={faTimeline} />{" "}
									思い出タイムラインをひらく
								</Link>
								<Link className={styles.secondaryAction} href="/events">
									すべてのイベント
								</Link>
							</div>
							<nav className={styles.yearRail} aria-label="年代から見る">
								{[2015, 2017, 2019, 2021, 2023, 2025].map((year) => (
									<Link key={year} href={`/timeline?year=${year}`}>
										{year}
									</Link>
								))}
							</nav>
						</div>
					</section>

					<section className={styles.archiveSection}>
						<div className={styles.sectionHeading}>
							<div>
								<p>EXPLORE</p>
								<h2>何から思い出す？</h2>
							</div>
							<Link href="/timeline?year=2022">
								時間軸ですべて見る <FontAwesomeIcon icon={faArrowRight} />
							</Link>
						</div>
						<div className={styles.doorGrid}>
							{archiveDoors.map((door) => (
								<Link
									key={door.label}
									href={door.href}
									className={styles.door}
									style={{ "--door-color": door.color } as CSSProperties}
								>
									<div className={styles.doorIcon}>
										<FontAwesomeIcon icon={door.icon} />
									</div>
									<p>{door.label}</p>
									<h3>{door.title}</h3>
									<span>{door.copy}</span>
									<i>
										<FontAwesomeIcon icon={faArrowRight} />
									</i>
								</Link>
							))}
						</div>
					</section>

					<section className={styles.storyBanner}>
						<div>
							<p>FEATURED STORY</p>
							<h2>4018日の軌跡を辿る。</h2>
							<span>わーすた結成11周年記念</span>
						</div>
						<Link href="/exclusive/anniversary-11th">
							特設展示を見る <FontAwesomeIcon icon={faArrowRight} />
						</Link>
					</section>

					<section className={styles.latestSection}>
						<div className={styles.sectionHeading}>
							<div>
								<p>RECENT RECORDS</p>
								<h2>新しく加わった記録</h2>
							</div>
							<Link href="/events">
								イベント一覧 <FontAwesomeIcon icon={faArrowRight} />
							</Link>
						</div>
						<div className={styles.eventGrid}>
							{events.slice(0, 6).map((event) => (
								<Link
									key={event.event_id}
									href={`/events/${event.event_id}`}
									className={styles.eventCard}
								>
									<div className={styles.eventImage}>
										<img
											src={event.image_url || "/event-placeholder.png"}
											alt=""
										/>
										<span>{formatDate(event.date)}</span>
									</div>
									<div>
										<p>EVENT</p>
										<h3>{event.event_name}</h3>
										<span>{event.location || "会場情報なし"}</span>
									</div>
								</Link>
							))}
						</div>
					</section>

					<section className={styles.movieSection}>
						<div className={styles.sectionHeading}>
							<div>
								<p>WATCH</p>
								<h2>映像から戻る、あの日。</h2>
							</div>
							<Link href="/movies">
								動画一覧 <FontAwesomeIcon icon={faArrowRight} />
							</Link>
						</div>
						<div className={styles.movieRail}>
							{movies.slice(0, 6).map((movie) => {
								const id = extractYouTubeVideoId(movie.youtube_links.url);
								return (
									<a
										key={movie.youtube_link_id}
										href={movie.youtube_links.url}
										target="_blank"
										rel="noreferrer"
										className={styles.movieCard}
									>
										<div>
											{id ? (
												<img
													src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
													alt="YouTube動画"
												/>
											) : (
												<span>VIDEO</span>
											)}
											<i>▶</i>
										</div>
										<p>
											公式・関連動画 <FontAwesomeIcon icon={faArrowRight} />
										</p>
									</a>
								);
							})}
						</div>
					</section>
				</div>
			</DefaultLayout>
		</>
	);
}
