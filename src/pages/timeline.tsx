import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import {
	demoArchiveItems,
	members,
	type TimelineDemoItem,
	type TimelineKind,
	timelineYears,
} from "@/data/timelineDemo";
import { getCostumes } from "@/lib/supabase/getCostumes";
import { getEvents } from "@/lib/supabase/getEvents";
import { getSongs } from "@/lib/supabase/getSongs";
import {
	getTimelineMovies,
	type TimelineMovie,
} from "@/lib/supabase/getTimelineMovies";
import type { Costume, Song } from "@/types/archive";
import type { Event } from "@/types/event";
import styles from "./timeline.module.scss";

const kindLabels: Record<TimelineKind, string> = {
	event: "EVENT",
	song: "SONG",
	costume: "COSTUME",
	video: "VIDEO",
	milestone: "MILESTONE",
};

const kindColors: Record<TimelineKind, string> = {
	event: "#7ec8d9",
	song: "#f2a2c8",
	costume: "#c6a4c6",
	video: "#fbcc7e",
	milestone: "#8abf92",
};

const memberSlugForEvent = (event: Event) => {
	const haystack = `${event.event_name} ${event.description || ""}`;
	return members
		.filter((member) => haystack.includes(member.name))
		.map((member) => member.slug);
};

const eventToTimelineItem = (event: Event): TimelineDemoItem => ({
	id: `event-${event.event_id}`,
	kind: "event",
	date: event.date,
	title: event.event_name,
	summary:
		event.description ||
		`${event.location || "会場未登録"}で開催されたイベント。`,
	members: memberSlugForEvent(event),
	isGroupWide: memberSlugForEvent(event).length === 0,
	sources: [{ label: "登録済みイベント情報" }],
	href: `/events/${event.event_id}`,
});

const movieToTimelineItem = (movie: TimelineMovie): TimelineDemoItem => ({
	id: `video-${movie.youtube_link_id}`,
	kind: "video",
	date: movie.events?.date || "",
	title: `動画：${movie.events?.event_name || "イベント映像"}`,
	summary: "登録済みイベントに関連づけられたYouTube動画です。",
	members: [],
	isGroupWide: true,
	sources: [{ label: "YouTube", url: movie.youtube_links?.url }],
	href: movie.youtube_links?.url,
});

const songToTimelineItem = (song: Song): TimelineDemoItem => ({
	id: `song-${song.song_id}`,
	kind: "song",
	date: song.first_performed_date || song.release_date || "",
	title: song.title,
	summary: song.description || "出典を確認できる楽曲記録です。",
	members: [],
	isGroupWide: true,
	sources: (song.song_sources || []).map((source) => ({
		label: source.label,
		url: source.url,
	})),
	href: `/songs/${song.song_id}`,
});

const costumeToTimelineItem = (costume: Costume): TimelineDemoItem => ({
	id: `costume-${costume.costume_id}`,
	kind: "costume",
	date: costume.debut_date || "",
	title: costume.name,
	summary: costume.description || "出典を確認できる衣装記録です。",
	members: [],
	isGroupWide: true,
	sources: (costume.costume_sources || []).map((source) => ({
		label: source.label,
		url: source.url,
	})),
	href: `/costumes/${costume.costume_id}`,
});

const getYear = (value: string | string[] | undefined) => {
	const parsed = Number(Array.isArray(value) ? value[0] : value);
	return timelineYears.includes(parsed) ? parsed : 2022;
};

const getMember = (value: string | string[] | undefined) => {
	const slug = Array.isArray(value) ? value[0] : value;
	return members.some((member) => member.slug === slug) ? slug || "all" : "all";
};

const getKind = (value: string | string[] | undefined) => {
	const kind = Array.isArray(value) ? value[0] : value;
	return kind && Object.hasOwn(kindLabels, kind) ? kind : "all";
};

export async function getServerSideProps() {
	let events: Event[] = [];
	let movies: TimelineMovie[] = [];
	let songs: Song[] = [];
	let costumes: Costume[] = [];
	try {
		[events, movies, songs, costumes] = await Promise.all([
			getEvents({
				startDate: "2015-01-01",
				endDate: "2026-12-31",
				ascending: true,
			}),
			getTimelineMovies(),
			getSongs(),
			getCostumes(),
		]);
	} catch (error) {
		console.error("Timeline demo could not load archive data", error);
	}
	return { props: { events, movies, songs, costumes } };
}

export default function TimelinePage({
	events,
	movies,
	songs,
	costumes,
}: {
	events: Event[];
	movies: TimelineMovie[];
	songs: Song[];
	costumes: Costume[];
}) {
	const router = useRouter();
	const [year, setYear] = useState(2022);
	const [member, setMember] = useState("all");
	const [kind, setKind] = useState("all");

	useEffect(() => {
		if (!router.isReady) return;
		setYear(getYear(router.query.year));
		setMember(getMember(router.query.member));
		setKind(getKind(router.query.kind));
	}, [
		router.isReady,
		router.query.kind,
		router.query.member,
		router.query.year,
	]);

	const updateFilter = (
		nextYear: number,
		nextMember: string,
		nextKind = kind,
	) => {
		setYear(nextYear);
		setMember(nextMember);
		setKind(nextKind);
		const query: Record<string, string> = { year: String(nextYear) };
		if (nextMember !== "all") query.member = nextMember;
		if (nextKind !== "all") query.kind = nextKind;
		void router.push({ pathname: "/timeline", query }, undefined, {
			shallow: true,
		});
	};

	const items = useMemo(() => {
		const merged = [
			...events.map(eventToTimelineItem),
			...movies.map(movieToTimelineItem),
			...songs.map(songToTimelineItem).filter((item) => item.date),
			...costumes.map(costumeToTimelineItem).filter((item) => item.date),
			...demoArchiveItems.filter((item) => item.kind === "milestone"),
		];
		const unique = Array.from(
			new Map(merged.map((item) => [item.id, item])).values(),
		);
		return unique
			.filter((item) => new Date(item.date).getFullYear() === year)
			.filter(
				(item) =>
					member === "all" || item.isGroupWide || item.members.includes(member),
			)
			.filter((item) => kind === "all" || item.kind === kind)
			.sort((a, b) => a.date.localeCompare(b.date));
	}, [costumes, events, kind, member, movies, songs, year]);

	let previousMonth = "";
	const selectedMember = members.find((item) => item.slug === member);

	return (
		<>
			<NextSeo title="思い出タイムライン" />
			<DefaultLayout>
				<div className={styles.page}>
					<header className={styles.hero}>
						<div className={styles.eyebrow}>
							<span>●</span> MEMORY TIMELINE
						</div>
						<h1 className={styles.title}>
							あの頃のわーすたに、
							<span className={styles.titleAccent}>もう一度会いにいく。</span>
						</h1>
						<p className={styles.intro}>
							年代と推しメンを選ぶと、イベント、初披露曲、衣装、動画、節目がひとつの時間軸に集まります。出典を確認できる記録だけで、あの年を辿れます。
						</p>
					</header>

					<section
						className={styles.controls}
						aria-label="タイムラインの絞り込み"
					>
						<div className={`${styles.controlInner} ${styles.filters}`}>
							<div>
								<span className={styles.controlLabel}>年代を選ぶ</span>
								<div className={styles.controlRow}>
									{timelineYears.map((item) => (
										<button
											key={item}
											type="button"
											aria-pressed={year === item}
											className={`${styles.chip} ${year === item ? styles.chipActive : ""}`}
											onClick={() => updateFilter(item, member)}
										>
											{item}
										</button>
									))}
								</div>
							</div>
							<div>
								<span className={styles.controlLabel}>推しメンで見る</span>
								<div className={styles.controlRow}>
									<button
										type="button"
										aria-pressed={member === "all"}
										className={`${styles.chip} ${member === "all" ? styles.chipActive : ""}`}
										onClick={() => updateFilter(year, "all")}
									>
										全員
									</button>
									{members.map((item) => (
										<button
											key={item.slug}
											type="button"
											aria-pressed={member === item.slug}
											className={`${styles.chip} ${member === item.slug ? styles.chipActive : ""}`}
											style={
												member === item.slug
													? {
															background: item.color,
															borderColor: item.color,
															color: "#29242b",
														}
													: undefined
											}
											onClick={() => updateFilter(year, item.slug)}
										>
											{item.shortName}
										</button>
									))}
								</div>
							</div>
							<div>
								<span className={styles.controlLabel}>記録の種類</span>
								<div className={styles.controlRow}>
									<button
										type="button"
										aria-pressed={kind === "all"}
										className={`${styles.chip} ${kind === "all" ? styles.chipActive : ""}`}
										onClick={() => updateFilter(year, member, "all")}
									>
										すべて
									</button>
									{(Object.keys(kindLabels) as TimelineKind[]).map((item) => (
										<button
											key={item}
											type="button"
											aria-pressed={kind === item}
											className={`${styles.chip} ${kind === item ? styles.chipActive : ""}`}
											onClick={() => updateFilter(year, member, item)}
										>
											{kindLabels[item]}
										</button>
									))}
								</div>
							</div>
						</div>
					</section>

					<main className={styles.main}>
						<div className={styles.summary}>
							<h2>
								{year}年
								{selectedMember ? `・${selectedMember.shortName}推し` : ""}
							</h2>
							<p aria-live="polite">{items.length}件の記録</p>
						</div>
						<div className={styles.timeline}>
							{items.length === 0 && (
								<div className={styles.empty}>
									この条件で表示できる記録はまだありません。「全員」に戻すか、別の年代を選んでください。
								</div>
							)}
							{items.map((item) => {
								const month = new Intl.DateTimeFormat("ja-JP", {
									year: "numeric",
									month: "long",
								}).format(new Date(item.date));
								const showMonth = month !== previousMonth;
								previousMonth = month;
								const content = (
									<article className={styles.card}>
										<div className={styles.meta}>
											<span className={styles.kind}>
												{kindLabels[item.kind]}
											</span>
											<time className={styles.date}>
												{item.date.replaceAll("-", ".")}
											</time>
										</div>
										<h3>{item.title}</h3>
										<p className={styles.cardText}>{item.summary}</p>
										<div className="flex flex-wrap gap-4">
											{item.href && (
												<a className={styles.source} href={item.href}>
													詳細を見る →
												</a>
											)}
											{item.sources.map((source) =>
												source.url ? (
													<a
														key={source.label}
														className={styles.source}
														href={source.url}
														target="_blank"
														rel="noreferrer"
													>
														出典：{source.label} ↗
													</a>
												) : (
													<span key={source.label} className={styles.source}>
														出典：{source.label}
													</span>
												),
											)}
										</div>
									</article>
								);
								return (
									<div key={item.id}>
										{showMonth && <h3 className={styles.month}>{month}</h3>}
										<div className={styles.item}>
											<span
												className={styles.dot}
												style={{ background: kindColors[item.kind] }}
											/>
											<time className={styles.desktopDate}>
												{item.date.slice(5).replace("-", ".")}
											</time>
											{content}
										</div>
									</div>
								);
							})}
						</div>
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
