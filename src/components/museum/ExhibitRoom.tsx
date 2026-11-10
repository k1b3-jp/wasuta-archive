import Link from "next/link";
import { useState } from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import {
	type Exhibit,
	eventEvidenceLabel,
	phaseLabels,
	phases,
	safeSourceUrl,
	visibleCards,
} from "@/lib/museum/model";
import styles from "./ExhibitRoom.module.scss";

const relations = {
	announcement: "開催の告知",
	performance_report: "実施に関する記録",
	reflection: "振り返り",
};
export default function ExhibitRoom({ exhibit }: { exhibit: Exhibit | null }) {
	const [member, setMember] = useState("");
	const [mode, setMode] = useState("all");
	const [cutoff, setCutoff] = useState(exhibit?.event.date ?? "");
	if (!exhibit)
		return (
			<DefaultLayout>
				<div className={styles.room}>
					<h1>展示資料を読み込めませんでした</h1>
					<p>
						資料が存在しないという意味ではありません。時間をおいて再読み込みしてください。
					</p>
					<Link href="/events">イベント一覧に戻る</Link>
				</div>
			</DefaultLayout>
		);
	const { event, cards, editorialPreview } = exhibit;
	const shown = visibleCards(cards, member, mode === "journey" ? cutoff : null);
	const extraSpeakers = [
		...new Set(
			cards
				.filter(
					(card) => card.member_id === null && card.speaker !== "わーすた公式",
				)
				.map((card) => card.speaker),
		),
	];
	const selected = member.startsWith("speaker:")
		? member.slice(8)
		: exhibit.members.find((item) => String(item.member_id) === member)?.name;
	const sourceCards = shown.filter(
		(card, index, array) =>
			array.findIndex((item) => item.source.url === card.source.url) === index,
	);
	return (
		<DefaultLayout>
			<NextSeo
				title={`${event.event_name}｜一公演の展示室`}
				noindex={editorialPreview}
			/>
			<article className={styles.room}>
				{editorialPreview && (
					<aside className={styles.review} role="note">
						<strong>編集確認用・非公開プレビュー</strong>
						<p>
							以下は実資料をもとにした未承認の編集案です。公開画面には出ません。本人の原文・画像・映像は転載していません。
						</p>
					</aside>
				)}
				<nav aria-label="展示の位置">
					<Link href="/timeline?from=2015-01-01&to=2015-12-31">年表</Link>
					<span> / </span>
					<Link href={`/events/${event.event_id}`}>既存の公演記録</Link>
					<span> / 展示室</span>
				</nav>
				<header className={styles.hero}>
					<p className={styles.eyebrow}>
						DIGITAL MUSEUM · EVENT {event.event_id}
					</p>
					<h1>
						あの日から、
						<br />
						言葉をたどる。
					</h1>
					<h2>{event.event_name}</h2>
					<p className={styles.note}>
						資料上の状態：
						{eventEvidenceLabel(event.date, cards, editorialPreview)}
					</p>
					<p className={styles.meta}>
						登録された公演日 {event.date} ・ 会場 {event.location ?? "未確認"}
					</p>
					<p>一つの公演を、発信された時点と、それぞれの視点から訪ねます。</p>
					<p className={styles.note}>
						{cards.some((card) => card.id === "official-live-history") && (
							<>
								<a href="#official-live-history">公演名と日付の根拠</a> ·{" "}
							</>
						)}
						{cards.some((card) => card.id === "ririka-year-end") && (
							<a href="#ririka-year-end">会場の記述</a>
						)}
					</p>
					<p className={styles.note}>
						公演名・日付・会場は
						<Link href={`/events/${event.event_id}`}>既存イベント記録</Link>
						による表示です。開催の実施確認と告知は、下の資料ごとに区別します。
					</p>
					<a href="#passages" className={styles.start}>
						資料をたどる ↓
					</a>
				</header>
				<section className={styles.controls} aria-labelledby="controls-heading">
					<h2 id="controls-heading">どの視点から訪ねますか</h2>
					<div className={styles.fields}>
						<label>
							発信者
							<select
								value={member}
								onChange={(e) => setMember(e.target.value)}
							>
								<option value="">すべての視点</option>
								<option value="speaker:わーすた公式">わーすた公式</option>
								{exhibit.members.map((item) => (
									<option key={item.member_id} value={item.member_id}>
										{item.name}
									</option>
								))}
								{extraSpeakers.map((name) => (
									<option key={name} value={`speaker:${name}`}>
										{name}（人物ID照合待ち）
									</option>
								))}
							</select>
						</label>
						<label>
							読み方
							<select value={mode} onChange={(e) => setMode(e.target.value)}>
								<option value="all">一覧で見る</option>
								<option value="journey">当時をたどる</option>
							</select>
						</label>
						{mode === "journey" && (
							<label>
								この日までの発信
								<input
									type="date"
									min="2015-03-29"
									max="2026-11-08"
									value={cutoff}
									onChange={(e) => setCutoff(e.target.value)}
								/>
							</label>
						)}
					</div>
					<p className={styles.note}>
						{mode === "journey"
							? "元の発信日と公開時点を確認できた資料だけを、日単位で表示します。移転記事の日時未確認資料は含めません。"
							: "資料の発信日と公演日は別々に表示します。要約は本人の原文ではありません。"}
					</p>
					<p aria-live="polite">
						{shown.length}件
						{selected ? ` · ${selected}の視点` : " · すべての視点"}
						{editorialPreview ? " · 全件、編集確認待ち" : " · 公開承認済み資料"}
					</p>
				</section>
				<div id="passages" className={styles.chapters}>
					{phases.map((phase, index) => (
						<section
							key={phase}
							className={styles.chapter}
							aria-labelledby={`phase-${phase}`}
						>
							<div className={styles.chapterTitle}>
								<span>0{index + 1}</span>
								<h2 id={`phase-${phase}`}>{phaseLabels[phase]}</h2>
							</div>
							<div className={styles.cards}>
								{shown.filter((card) => card.phase === phase).length ? (
									shown
										.filter((card) => card.phase === phase)
										.map((card) => (
											<article
												key={card.id}
												id={card.id}
												className={styles.card}
												data-claim-id={card.id}
											>
												<p className={styles.eyebrow}>
													{card.speaker} · {relations[card.relation_kind]}
												</p>
												<h3>{card.source.title}</h3>
												<dl>
													<div>
														<dt>発信日</dt>
														<dd>
															{card.published_on ?? "未確認"}
															{card.date_precision === "instant" &&
															card.published_at
																? `（${new Date(card.published_at).toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" })} JST）`
																: ""}
														</dd>
													</div>
													<div>
														<dt>関連する公演日</dt>
														<dd>{event.date}</dd>
													</div>
												</dl>
												{card.original_date_label && (
													<p className={styles.note}>
														{card.original_date_label}
													</p>
												)}
												<p className={styles.summaryLabel}>
													編集要約{editorialPreview ? "・承認待ち" : ""}
												</p>
												<p className={styles.summary}>{card.summary}</p>
												<details>
													<summary>出典と該当箇所</summary>
													<p>{card.source.publisher ?? "発行者未確認"}</p>
													<p>該当箇所：{card.locator}</p>
													<p>
														閲覧状態：
														{card.source.availability_status === "available"
															? "本文確認済み（調査時点）"
															: "取得状態を要確認"}
													</p>
													{safeSourceUrl(card.source.url) ? (
														<a
															href={safeSourceUrl(card.source.url) ?? undefined}
															target="_blank"
															rel="noopener noreferrer"
														>
															原資料を開く ↗
														</a>
													) : (
														<p>安全な出典URLを確認できません</p>
													)}
												</details>
												<a href="#sources" className={styles.sourceLink}>
													出典一覧へ →
												</a>
											</article>
										))
								) : (
									<p className={styles.empty}>
										この展示では{selected ? `${selected}の` : ""}
										資料を確認できていません。発信がなかったことを示すものではありません。
										{mode === "journey"
											? "日時未確認・選択日以降の資料は表示されません。"
											: ""}
									</p>
								)}
							</div>
						</section>
					))}
				</div>
				<section className={styles.related}>
					<p className={styles.eyebrow}>CONTINUE EXPLORING</p>
					<h2>楽曲と、ほかの記録へ</h2>
					{exhibit.songs.length ? (
						<ul>
							{exhibit.songs.map((song) => (
								<li key={song.song_id}>
									<Link href={`/songs/${song.song_id}`}>{song.title}</Link>
									（登録関係：{song.relation_type}）
								</li>
							))}
						</ul>
					) : (
						<p>
							この公演と楽曲の承認済み関連は未登録です。候補曲の初披露・曲順をここでは断定しません。
						</p>
					)}
					{editorialPreview && exhibit.candidateSongs?.length ? (
						<div>
							<h3>資料が挙げる関連曲（編集確認待ち）</h3>
							<ul>
								{exhibit.candidateSongs.map((song) => (
									<li key={song.song_id}>
										<Link href={`/songs/${song.song_id}`}>{song.title}</Link> ·{" "}
										<a href={`#${song.claim_id}`}>初披露の記述を確認する</a>
									</li>
								))}
							</ul>
							<p className={styles.note}>
								曲順は未確認です。この候補は公開用の公演・楽曲関連には登録していません。
							</p>
						</div>
					) : null}
					<div className={styles.links}>
						<Link href={`/events/${event.event_id}/movie`}>
							この公演の動画記録 →
						</Link>
						<Link href="/songs">楽曲一覧 →</Link>
						<Link href="/costumes">衣装一覧 →</Link>
					</div>
				</section>
				<section id="sources" className={styles.sources}>
					<h2>出典・収録範囲</h2>
					<p>
						調査基準日：2026-11-08（日本時間）。今回の探索範囲は2015-03-30〜2015-05-29を起点とし、年末の振り返りと後年のインタビューを補足しています。全履歴の収集は完了していません。
					</p>
					<ul>
						{sourceCards.map((card) => (
							<li key={card.source.url}>
								{safeSourceUrl(card.source.url) ? (
									<a
										href={safeSourceUrl(card.source.url) ?? undefined}
										target="_blank"
										rel="noopener noreferrer"
									>
										{card.source.title} ↗
									</a>
								) : (
									card.source.title
								)}{" "}
								· <a href={`#${card.id}`}>対応する編集要約</a>
							</li>
						))}
					</ul>
					<p>
						当日・終演直後の資料、廣川奈々聖の対象公演に関する資料、旧アカウントの全履歴、転載・埋め込みの許諾は確認が残っています。移転ブログは本文中の日付と実際の公開日時を区別し、公開時点が確定しないものを「当時をたどる」から除外します。
					</p>
					<p>
						非公式ファンアーカイブです。公式に許諾されたミュージアムではありません。画像・動画・原文の転載は行わず、要約と出典リンクを用いています。
					</p>
				</section>
			</article>
		</DefaultLayout>
	);
}
