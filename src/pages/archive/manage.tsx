import Link from "next/link";
import { useRouter } from "next/router";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import { useAuth } from "@/contexts/AuthContext";
import {
	authenticatedGet,
	authenticatedPost,
} from "@/lib/api/authenticatedRequest";
import styles from "./manage.module.scss";

type Kind = "song" | "costume";
type RecordItem = {
	song_id?: number;
	costume_id?: number;
	slug: string;
	title?: string;
	name?: string;
	release_date?: string | null;
	first_performed_date?: string | null;
	debut_date?: string | null;
	description?: string | null;
	image_url?: string | null;
	status: string;
	song_sources?: SourceRef[];
	costume_sources?: SourceRef[];
	song_events?: Array<{ event_id: number }>;
	costume_events?: Array<{ event_id: number }>;
};
type EventOption = { event_id: number; event_name: string; date: string };
type SourceRef = { label: string; url: string };
type Source = {
	source_id: number;
	url: string;
	title: string;
	source_kind: string;
	availability_status: string;
	archived_url: string | null;
	updated_at: string;
};
type Quality = {
	counts: {
		events: number;
		songs: number;
		costumes: number;
		milestones: number;
	};
	sources: { total: number; unchecked: number; unavailable: number };
	relations: { events: number; songs: number; costumes: number };
};
const blank = {
	recordId: null as number | null,
	slug: "",
	title: "",
	primaryDate: "",
	secondaryDate: "",
	description: "",
	imageUrl: "",
	sourceUrl: "",
	sourceTitle: "",
	sourceKind: "official",
	relatedEventId: "",
};

export default function ArchiveManagePage() {
	const router = useRouter();
	const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
	const [kind, setKind] = useState<Kind>("song");
	const [records, setRecords] = useState<Record<Kind, RecordItem[]>>({
		song: [],
		costume: [],
	});
	const [sources, setSources] = useState<Source[]>([]);
	const [events, setEvents] = useState<EventOption[]>([]);
	const [quality, setQuality] = useState<Quality | null>(null);
	const [form, setForm] = useState(blank);
	const [saving, setSaving] = useState(false);
	const [confirmedFacts, setConfirmedFacts] = useState(false);
	const [checkingLinks, setCheckingLinks] = useState(false);
	const [view, setView] = useState<"records" | "sources">("records");
	useEffect(() => {
		if (!authLoading && (!isLoggedIn || !isAdmin))
			void router.push(isLoggedIn ? "/milestones" : "/login?toast=login");
	}, [authLoading, isAdmin, isLoggedIn, router]);
	const load = useCallback(async () => {
		if (!isAdmin) return;
		try {
			const [data, sourceData, qualityData] = await Promise.all([
				authenticatedGet<{
					songs: RecordItem[];
					costumes: RecordItem[];
					events: EventOption[];
				}>("/api/archive/records"),
				authenticatedGet<{ sources: Source[] }>("/api/archive/sources"),
				authenticatedGet<Quality>("/api/archive/quality"),
			]);
			setRecords({ song: data.songs, costume: data.costumes });
			setSources(sourceData.sources);
			setEvents(data.events);
			setQuality(qualityData);
		} catch (e) {
			toast.error(
				e instanceof Error ? e.message : "管理データを取得できませんでした",
			);
		}
	}, [isAdmin]);
	useEffect(() => {
		void load();
	}, [load]);
	const edit = (item: RecordItem) => {
		setConfirmedFacts(false);
		const source = (
			kind === "song" ? item.song_sources : item.costume_sources
		)?.[0];
		setForm({
			recordId: Number(kind === "song" ? item.song_id : item.costume_id),
			slug: item.slug,
			title: item.title ?? item.name ?? "",
			primaryDate:
				(kind === "song" ? item.first_performed_date : item.debut_date) ?? "",
			secondaryDate: item.release_date ?? "",
			description: item.description ?? "",
			imageUrl: item.image_url ?? "",
			sourceUrl: source?.url ?? "",
			sourceTitle: source?.label ?? "",
			sourceKind: "official",
			relatedEventId: String(
				(kind === "song" ? item.song_events : item.costume_events)?.[0]
					?.event_id ?? "",
			),
		});
	};
	const submit = async (event: FormEvent, publish: boolean) => {
		event.preventDefault();
		setSaving(true);
		try {
			await authenticatedPost("/api/archive/records", {
				kind,
				...form,
				relatedEventId: form.relatedEventId
					? Number(form.relatedEventId)
					: null,
				publish,
			});
			toast.success(publish ? "確認して公開しました" : "下書き保存しました");
			setForm(blank);
			await load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "保存できませんでした");
		} finally {
			setSaving(false);
		}
	};
	const updateSource = async (
		source: Source,
		availability: string,
		archivedUrl: string,
	) => {
		try {
			await authenticatedPost("/api/archive/sources", {
				sourceId: source.source_id,
				availability,
				archivedUrl,
			});
			toast.success("出典状態を更新しました");
			await load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "更新できませんでした");
		}
	};
	const checkLinks = async () => {
		setCheckingLinks(true);
		try {
			const result = await authenticatedPost<{ checked: number }>(
				"/api/archive/check-links",
				{},
			);
			toast.success(`${result.checked}件の出典を確認しました`);
			await load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "リンク確認に失敗しました");
		} finally {
			setCheckingLinks(false);
		}
	};
	if (authLoading || !isAdmin)
		return (
			<>
				<NextSeo title="アーカイブ管理" />
				<DefaultLayout>
					<div className={styles.page}>
						<main className={styles.main}>
							<div className={styles.empty}>権限を確認しています…</div>
						</main>
					</div>
				</DefaultLayout>
			</>
		);
	return (
		<>
			<NextSeo title="アーカイブ管理" />
			<DefaultLayout>
				<div className={styles.page}>
					<header className={styles.hero}>
						<div>
							<Link href="/milestones">← 節目の管理へ</Link>
							<p>ARCHIVE ADMIN</p>
							<h1>記録と出典を整える。</h1>
							<span>
								楽曲・衣装の下書きと公開、出典の閲覧状態と保存URLを1か所で管理します。
							</span>
						</div>
					</header>
					<main className={styles.main}>
						{quality && (
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									gap: ".7rem",
									marginBottom: "1rem",
									fontSize: ".7rem",
									fontWeight: 800,
								}}
							>
								<span>イベント {quality.counts.events}</span>
								<span>楽曲 {quality.counts.songs}</span>
								<span>衣装 {quality.counts.costumes}</span>
								<span>節目 {quality.counts.milestones}</span>
								<span>未確認出典 {quality.sources.unchecked}</span>
							</div>
						)}
						<div className={styles.viewTabs}>
							<button
								className={view === "records" ? styles.active : ""}
								onClick={() => setView("records")}
								type="button"
							>
								楽曲・衣装
							</button>
							<button
								className={view === "sources" ? styles.active : ""}
								onClick={() => setView("sources")}
								type="button"
							>
								出典状態
							</button>
						</div>
						{view === "records" ? (
							<div className={styles.columns}>
								<section>
									<div className={styles.kindTabs}>
										{(["song", "costume"] as Kind[]).map((value) => (
											<button
												type="button"
												className={kind === value ? styles.active : ""}
												onClick={() => {
													setKind(value);
													setForm(blank);
												}}
												key={value}
											>
												{value === "song" ? "楽曲" : "衣装"}
											</button>
										))}
									</div>
									<button
										type="button"
										className={styles.newButton}
										onClick={() => setForm(blank)}
									>
										＋ 新規作成
									</button>
									<div className={styles.list}>
										{records[kind].map((item) => (
											<button
												type="button"
												onClick={() => edit(item)}
												key={item.song_id ?? item.costume_id}
											>
												<span>{item.status}</span>
												<b>{item.title ?? item.name}</b>
												<small>
													{item.first_performed_date ??
														item.debut_date ??
														item.release_date ??
														"日付未登録"}
												</small>
											</button>
										))}
									</div>
								</section>
								<form
									className={styles.form}
									onSubmit={(event) => void submit(event, false)}
								>
									<p>{form.recordId ? "EDIT RECORD" : "NEW RECORD"}</p>
									<h2>{kind === "song" ? "楽曲" : "衣装"}の記録</h2>
									<label>
										slug
										<input
											required
											disabled={form.recordId !== null}
											pattern="[a-z0-9]+(-[a-z0-9]+)*"
											value={form.slug}
											onChange={(e) =>
												setForm({ ...form, slug: e.target.value })
											}
										/>
									</label>
									<label>
										名称
										<input
											required
											value={form.title}
											onChange={(e) =>
												setForm({ ...form, title: e.target.value })
											}
										/>
									</label>
									<div className={styles.two}>
										<label>
											{kind === "song" ? "初披露日" : "初登場日"}
											<input
												type="date"
												value={form.primaryDate}
												onChange={(e) =>
													setForm({ ...form, primaryDate: e.target.value })
												}
											/>
										</label>
										{kind === "song" && (
											<label>
												リリース日
												<input
													type="date"
													value={form.secondaryDate}
													onChange={(e) =>
														setForm({ ...form, secondaryDate: e.target.value })
													}
												/>
											</label>
										)}
									</div>
									<label>
										事実の説明
										<textarea
											rows={4}
											value={form.description}
											onChange={(e) =>
												setForm({ ...form, description: e.target.value })
											}
										/>
									</label>
									<label>
										画像URL
										<input
											type="url"
											value={form.imageUrl}
											onChange={(e) =>
												setForm({ ...form, imageUrl: e.target.value })
											}
										/>
									</label>
									<label>
										出典名
										<input
											required
											value={form.sourceTitle}
											onChange={(e) =>
												setForm({ ...form, sourceTitle: e.target.value })
											}
										/>
									</label>
									<label>
										出典URL
										<input
											required
											type="url"
											value={form.sourceUrl}
											onChange={(e) =>
												setForm({ ...form, sourceUrl: e.target.value })
											}
										/>
									</label>
									<label>
										出典種別
										<select
											value={form.sourceKind}
											onChange={(e) =>
												setForm({ ...form, sourceKind: e.target.value })
											}
										>
											<option value="official">公式サイト</option>
											<option value="video">公式動画</option>
											<option value="social">公式SNS</option>
											<option value="web">Web</option>
											<option value="book">書籍</option>
										</select>
									</label>
									<label>
										関連イベント
										<select
											value={form.relatedEventId}
											onChange={(event) =>
												setForm({ ...form, relatedEventId: event.target.value })
											}
										>
											<option value="">関連なし</option>
											{events.map((event) => (
												<option value={event.event_id} key={event.event_id}>
													{event.date} {event.event_name}
												</option>
											))}
										</select>
									</label>
									<label>
										<span>
											<input
												type="checkbox"
												checked={confirmedFacts}
												onChange={(event) =>
													setConfirmedFacts(event.target.checked)
												}
											/>{" "}
											入力内容・日付・出典URLを確認した
										</span>
									</label>
									<div className={styles.actions}>
										<button disabled={saving} type="submit">
											下書き保存
										</button>
										<button
											disabled={saving || !form.primaryDate || !confirmedFacts}
											type="button"
											onClick={(event) =>
												void submit(event as unknown as FormEvent, true)
											}
										>
											確認して公開
										</button>
									</div>
								</form>
							</div>
						) : (
							<section className={styles.sourceList}>
								<button
									className={styles.newButton}
									disabled={checkingLinks}
									type="button"
									onClick={() => void checkLinks()}
								>
									{checkingLinks ? "確認中…" : "古い出典から最大50件を確認"}
								</button>
								{sources.map((source) => (
									<SourceRow
										source={source}
										onSave={updateSource}
										key={source.source_id}
									/>
								))}
							</section>
						)}
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}

function SourceRow({
	source,
	onSave,
}: {
	source: Source;
	onSave: (source: Source, status: string, archive: string) => Promise<void>;
}) {
	const [status, setStatus] = useState(source.availability_status);
	const [archive, setArchive] = useState(source.archived_url ?? "");
	return (
		<article>
			<div>
				<b>{source.title}</b>
				<a href={source.url} target="_blank" rel="noreferrer">
					{source.url}
				</a>
			</div>
			<select value={status} onChange={(e) => setStatus(e.target.value)}>
				<option value="unchecked">未確認</option>
				<option value="available">閲覧可</option>
				<option value="suspect">要確認</option>
				<option value="unavailable">閲覧不可</option>
			</select>
			<input
				aria-label="保存URL"
				type="url"
				placeholder="Internet Archive等の保存URL"
				value={archive}
				onChange={(e) => setArchive(e.target.value)}
			/>
			<button
				type="button"
				onClick={() => void onSave(source, status, archive)}
			>
				保存
			</button>
		</article>
	);
}
