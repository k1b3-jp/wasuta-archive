import Link from "next/link";
import type { CSSProperties } from "react";
import styles from "@/styles/archiveEntity.module.scss";
import type { ArchiveEventRelation, ArchiveSource } from "@/types/archive";
import formatDate from "@/utils/formatDate";

type Props = {
	kind: "song" | "costume";
	title: string;
	date?: string | null;
	description?: string | null;
	sources: ArchiveSource[];
	relations: ArchiveEventRelation[];
};

export default function ArchiveEntityDetail({
	kind,
	title,
	date,
	description,
	sources,
	relations,
}: Props) {
	const isSong = kind === "song";
	const listHref = isSong ? "/songs" : "/costumes";
	return (
		<article
			className={styles.page}
			style={
				{
					"--archive-hero": isSong
						? "linear-gradient(125deg,#252229,#5e304e 62%,#a85f88)"
						: "linear-gradient(125deg,#252229,#46344f 58%,#75618a)",
				} as CSSProperties
			}
		>
			<header className={styles.detailHero}>
				<div className={styles.inner}>
					<Link href={listHref} className={styles.back}>
						← {isSong ? "楽曲" : "衣装"}アーカイブへ
					</Link>
					<p className={styles.eyebrow}>
						{isSong ? "SONG RECORD" : "COSTUME RECORD"}
					</p>
					<h1>{title}</h1>
					<p className={styles.detailMeta}>
						{date
							? `${isSong ? "初披露・リリース記録" : "登場記録"} · ${formatDate(date)}`
							: "日付確認中"}
					</p>
				</div>
			</header>
			<div className={styles.detailBody}>
				<div className={styles.detailGrid}>
					<section className={styles.record}>
						<p className={styles.label}>ARCHIVE NOTE</p>
						<h2>記録されていること</h2>
						<p className={styles.description}>
							{description || "説明はまだ登録されていません。"}
						</p>
					</section>
					<aside className={styles.evidence}>
						<p className={styles.label}>SOURCES</p>
						<h2>確認した出典</h2>
						{sources.length ? (
							sources.map((source) => (
								<div className={styles.sourceItem} key={source.source_id}>
									{source.sources?.availability_status === "unavailable" && (
										<strong>元の出典は現在閲覧できません</strong>
									)}
									<a
										href={
											source.sources?.availability_status === "unavailable" &&
											source.sources.archived_url
												? source.sources.archived_url
												: source.url
										}
										target={
											source.url.startsWith("http") ? "_blank" : undefined
										}
										rel={
											source.url.startsWith("http") ? "noreferrer" : undefined
										}
									>
										<span>{source.label}</span>
										<span>
											{source.sources?.availability_status === "unavailable" &&
											source.sources.archived_url
												? "保存版 ↗"
												: "↗"}
										</span>
									</a>
									<time dateTime={source.accessed_on}>
										確認日 {formatDate(source.accessed_on)}
									</time>
								</div>
							))
						) : (
							<p className={styles.description}>出典情報を確認中です。</p>
						)}
					</aside>
				</div>
				{relations.length > 0 && (
					<section className={styles.related}>
						<p className={styles.label}>RELATED EVENTS</p>
						<h2>つながるイベント</h2>
						<div className={styles.relatedGrid}>
							{relations.map(
								(relation) =>
									relation.events && (
										<Link
											key={`${relation.events.event_id}-${relation.relation_type}`}
											href={`/events/${relation.events.event_id}`}
											className={styles.relatedCard}
										>
											<div>
												<p>{relation.relation_type.replaceAll("_", " ")}</p>
												<h3>{relation.events.event_name}</h3>
											</div>
											<span>→</span>
										</Link>
									),
							)}
						</div>
					</section>
				)}
				<p className={styles.note}>
					このページは公開情報の出典を確認できた事実だけで構成しています。新しい出典が確認できた場合、記録内容を更新することがあります。
				</p>
			</div>
		</article>
	);
}
