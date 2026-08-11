import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import { useAuth } from "@/contexts/AuthContext";
import {
	defaultMembers,
	type TimelineItem,
	type TimelineKind,
	type TimelineMember,
	timelineYears,
} from "@/data/timelineDemo";
import { getCostumes } from "@/lib/supabase/getCostumes";
import { getSongs } from "@/lib/supabase/getSongs";
import { getTimelineEvents } from "@/lib/supabase/getTimelineEvents";
import {
	getTimelineMemberRelations,
	type TimelineMemberRelations,
} from "@/lib/supabase/getTimelineMemberRelations";
import { getTimelineMembers } from "@/lib/supabase/getTimelineMembers";
import {
	getTimelineMilestones,
	type TimelineMilestone,
} from "@/lib/supabase/getTimelineMilestones";
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

const eventToTimelineItem = (
	event: Event,
	members: string[],
): TimelineItem => ({
	id: `event-${event.event_id}`,
	kind: "event",
	date: event.date,
	title: event.event_name,
	summary:
		event.description ||
		`${event.location || "会場未登録"}で開催されたイベント。`,
	members,
	isGroupWide: members.length === 0,
	sources: [{ label: "登録済みイベント情報" }],
	href: `/events/${event.event_id}`,
});

const movieToTimelineItem = (
	movie: TimelineMovie,
	members: string[],
): TimelineItem => ({
	id: `video-${movie.youtube_link_id}`,
	kind: "video",
	date: movie.events?.date || "",
	title: `動画：${movie.events?.event_name || "イベント映像"}`,
	summary: "登録済みイベントに関連づけられたYouTube動画です。",
	members,
	isGroupWide: members.length === 0,
	sources: [{ label: "YouTube", url: movie.youtube_links?.url }],
	href: movie.youtube_links?.url,
});

const songToTimelineItem = (song: Song, members: string[]): TimelineItem => ({
	id: `song-${song.song_id}`,
	kind: "song",
	date: song.first_performed_date || song.release_date || "",
	title: song.title,
	summary: song.description || "出典を確認できる楽曲記録です。",
	members,
	isGroupWide: members.length === 0,
	sources: (song.song_sources || []).map((source) => ({
		label: source.label,
		url: source.url,
	})),
	href: `/songs/${song.song_id}`,
});

const costumeToTimelineItem = (
	costume: Costume,
	members: string[],
): TimelineItem => ({
	id: `costume-${costume.costume_id}`,
	kind: "costume",
	date: costume.debut_date || "",
	title: costume.name,
	summary: costume.description || "出典を確認できる衣装記録です。",
	members,
	isGroupWide: members.length === 0,
	sources: (costume.costume_sources || []).map((source) => ({
		label: source.label,
		url: source.url,
	})),
	href: `/costumes/${costume.costume_id}`,
});

const milestoneToTimelineItem = (
	milestone: TimelineMilestone,
	memberOptions: TimelineMember[],
): TimelineItem => ({
	id: `milestone-${milestone.occurrence_id}`,
	kind: "milestone",
	date: milestone.occurred_on,
	title: milestone.title,
	summary: milestone.description || "出典を確認できる節目の記録です。",
	members: memberOptions
		.filter((member) => milestone.member_names.includes(member.name))
		.map((member) => member.slug),
	isGroupWide: milestone.is_group_wide,
	sources: milestone.sources,
	href: milestone.related_event_id
		? `/events/${milestone.related_event_id}`
		: undefined,
});

const getYear = (value: string | string[] | undefined) => {
	const parsed = Number(Array.isArray(value) ? value[0] : value);
	return timelineYears.includes(parsed) ? parsed : 2022;
};

const getMember = (
	value: string | string[] | undefined,
	memberOptions: TimelineMember[],
) => {
	const slug = Array.isArray(value) ? value[0] : value;
	return memberOptions.some((member) => member.slug === slug)
		? slug || "all"
		: "all";
};

const getKind = (value: string | string[] | undefined) => {
	const kind = Array.isArray(value) ? value[0] : value;
	return kind && Object.hasOwn(kindLabels, kind) ? kind : "all";
};

export async function getServerSideProps({
	res,
	query,
}: {
	res: { setHeader: (name: string, value: string) => void };
	query: Record<string, string | string[] | undefined>;
}) {
	res.setHeader(
		"Cache-Control",
		"public, s-maxage=300, stale-while-revalidate=1800",
	);
	const requestedYear = getYear(query.year);
	const results = await Promise.allSettled([
		getTimelineEvents(requestedYear),
		getTimelineMovies(),
		getSongs(),
		getCostumes(),
		getTimelineMilestones(),
		getTimelineMembers(),
		getTimelineMemberRelations(),
	]);

	const fallback = <T,>(index: number, label: string): T[] => {
		const result = results[index];
		if (result.status === "fulfilled") return result.value as T[];
		console.error(`Timeline could not load ${label}`, result.reason);
		return [];
	};

	return {
		props: {
			events: fallback<Event>(0, "events"),
			movies: fallback<TimelineMovie>(1, "movies").filter((item) =>
				item.events?.date?.startsWith(String(requestedYear)),
			),
			songs: fallback<Song>(2, "songs").filter((item) =>
				(item.first_performed_date ?? item.release_date)?.startsWith(
					String(requestedYear),
				),
			),
			costumes: fallback<Costume>(3, "costumes").filter((item) =>
				item.debut_date?.startsWith(String(requestedYear)),
			),
			milestones: fallback<TimelineMilestone>(4, "milestones").filter((item) =>
				item.occurred_on.startsWith(String(requestedYear)),
			),
			memberOptions:
				fallback<TimelineMember>(5, "members").length > 0
					? fallback<TimelineMember>(5, "members")
					: defaultMembers,
			memberRelations:
				results[6].status === "fulfilled"
					? results[6].value
					: { events: {}, songs: {}, costumes: {} },
		},
	};
}

export default function TimelinePage({
	events,
	movies,
	songs,
	costumes,
	milestones,
	memberOptions,
	memberRelations,
}: {
	events: Event[];
	movies: TimelineMovie[];
	songs: Song[];
	costumes: Costume[];
	milestones: TimelineMilestone[];
	memberOptions: TimelineMember[];
	memberRelations: TimelineMemberRelations;
}) {
	const router = useRouter();
	const { isLoggedIn } = useAuth();
	const [year, setYear] = useState(2022);
	const [member, setMember] = useState("all");
	const [kind, setKind] = useState("all");

	useEffect(() => {
		if (!router.isReady) return;
		setYear(getYear(router.query.year));
		setMember(getMember(router.query.member, memberOptions));
		setKind(getKind(router.query.kind));
	}, [
		router.isReady,
		router.query.kind,
		router.query.member,
		router.query.year,
		memberOptions,
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
		void router.push({ pathname: "/timeline", query });
	};

	const items = useMemo(() => {
		const merged = [
			...events.map((event) =>
				eventToTimelineItem(
					event,
					memberRelations.events[String(event.event_id)] ?? [],
				),
			),
			...movies.map((movie) =>
				movieToTimelineItem(
					movie,
					memberRelations.events[String(movie.event_id)] ?? [],
				),
			),
			...songs
				.map((song) =>
					songToTimelineItem(
						song,
						memberRelations.songs[String(song.song_id)] ?? [],
					),
				)
				.filter((item) => item.date),
			...costumes
				.map((costume) =>
					costumeToTimelineItem(
						costume,
						memberRelations.costumes[String(costume.costume_id)] ?? [],
					),
				)
				.filter((item) => item.date),
			...milestones.map((milestone) =>
				milestoneToTimelineItem(milestone, memberOptions),
			),
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
	}, [
		costumes,
		events,
		kind,
		member,
		memberOptions,
		memberRelations,
		milestones,
		movies,
		songs,
		year,
	]);

	let previousMonth = "";
	const selectedMember = memberOptions.find((item) => item.slug === member);

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
									{memberOptions.map((item) => (
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
							<div>
								<h2>
									{year}年
									{selectedMember ? `・${selectedMember.shortName}推し` : ""}
								</h2>
								<p aria-live="polite">{items.length}件の記録</p>
								{selectedMember && (
									<Link href={`/members/${selectedMember.slug}`}>
										{selectedMember.name}の全記録を見る →
									</Link>
								)}
							</div>
							{isLoggedIn && (
								<Link className={styles.editorLink} href="/milestones/create">
									節目を登録
								</Link>
							)}
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
