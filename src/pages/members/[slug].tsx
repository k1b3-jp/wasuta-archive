import type { GetServerSideProps } from "next";
import Link from "next/link";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import {
	getMemberArchive,
	type MemberArchive,
} from "@/lib/supabase/getMemberArchive";
import styles from "./memberDetail.module.scss";

export const getServerSideProps: GetServerSideProps = async ({
	params,
	res,
}) => {
	res.setHeader(
		"Cache-Control",
		"public, s-maxage=300, stale-while-revalidate=1800",
	);
	const slug = typeof params?.slug === "string" ? params.slug : "";
	try {
		const archive = await getMemberArchive(slug);
		return archive ? { props: { archive } } : { notFound: true };
	} catch (error) {
		console.error("Member archive could not load", error);
		return { notFound: true };
	}
};

const dateLabel = (date: string | null) =>
	date ? date.replaceAll("-", ".") : "日付未登録";

export default function MemberDetailPage({
	archive,
}: {
	archive: MemberArchive;
}) {
	const { member } = archive;
	const total =
		archive.events.length +
		archive.videos.length +
		archive.songs.length +
		archive.costumes.length +
		archive.milestones.length;
	const sections = [
		{
			key: "events",
			label: "EVENTS",
			title: "イベント",
			items: archive.events.map((item) => ({
				id: item.event_id,
				title: item.event_name,
				date: item.date,
				href: `/events/${item.event_id}`,
			})),
		},
		{
			key: "videos",
			label: "VIDEOS",
			title: "動画",
			items: archive.videos.map((item) => ({
				id: item.youtube_link_id,
				title: item.event_name,
				date: item.date,
				href: item.url,
			})),
		},
		{
			key: "songs",
			label: "SONGS",
			title: "楽曲",
			items: archive.songs.map((item) => ({
				id: item.song_id,
				title: item.title,
				date: item.date,
				href: `/songs/${item.song_id}`,
			})),
		},
		{
			key: "costumes",
			label: "COSTUMES",
			title: "衣装",
			items: archive.costumes.map((item) => ({
				id: item.costume_id,
				title: item.name,
				date: item.date,
				href: `/costumes/${item.costume_id}`,
			})),
		},
		{
			key: "milestones",
			label: "MILESTONES",
			title: "節目",
			items: archive.milestones.map((item) => ({
				id: item.milestone_id,
				title: item.title,
				date: item.date,
				href: `/timeline?member=${member.timeline_key}${item.date ? `&year=${item.date.slice(0, 4)}` : ""}`,
			})),
		},
	];
	return (
		<>
			<NextSeo
				title={`${member.name}のアーカイブ`}
				description={`${member.name}に関連する、出典確認済みのイベント・動画・楽曲・衣装・節目を横断して辿れます。`}
			/>
			<DefaultLayout>
				<div
					className={styles.page}
					style={{ "--member-color": member.color } as React.CSSProperties}
				>
					<header className={styles.hero}>
						<div className={styles.inner}>
							<Link href="/timeline">← 思い出タイムラインへ</Link>
							<p>MEMBER ARCHIVE</p>
							<h1>{member.name}</h1>
							<span>
								{member.short_name}
								の記録を、イベント・動画・楽曲・衣装・節目から横断して辿る。
							</span>
							<div className={styles.stats}>
								<b>{total}</b>
								<small>関連する記録</small>
								<b>{archive.events.length}</b>
								<small>イベント</small>
							</div>
						</div>
					</header>
					<nav className={styles.nav} aria-label="メンバーアーカイブ内リンク">
						<div className={styles.inner}>
							{sections.map((section) => (
								<a href={`#${section.key}`} key={section.key}>
									{section.title}
									<span>{section.items.length}</span>
								</a>
							))}
						</div>
					</nav>
					<main className={`${styles.inner} ${styles.content}`}>
						{sections.map((section) => (
							<section
								id={section.key}
								className={styles.section}
								key={section.key}
							>
								<div className={styles.sectionHead}>
									<div>
										<p>{section.label}</p>
										<h2>{section.title}</h2>
									</div>
									<span>{section.items.length}件</span>
								</div>
								{section.items.length ? (
									<div className={styles.grid}>
										{section.items.map((item) => (
											<Link
												href={item.href}
												className={styles.card}
												target={
													item.href.startsWith("http") ? "_blank" : undefined
												}
												rel={
													item.href.startsWith("http")
														? "noreferrer"
														: undefined
												}
												key={`${section.key}-${item.id}`}
											>
												<time>{dateLabel(item.date)}</time>
												<h3>{item.title}</h3>
												<span>記録を見る →</span>
											</Link>
										))}
									</div>
								) : (
									<div className={styles.empty}>
										関連が確認された記録はまだありません。
									</div>
								)}
							</section>
						))}
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
