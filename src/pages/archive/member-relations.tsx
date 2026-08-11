import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import { useAuth } from "@/contexts/AuthContext";
import {
	authenticatedGet,
	authenticatedPost,
} from "@/lib/api/authenticatedRequest";
import styles from "./member-relations.module.scss";

type Kind = "event" | "song" | "costume";
type Member = { member_id: number; name: string; timeline_key: string };
type Entity = {
	event_id?: number;
	song_id?: number;
	costume_id?: number;
	event_name?: string;
	title?: string;
	name?: string;
	date?: string;
	first_performed_date?: string | null;
	release_date?: string | null;
	debut_date?: string | null;
};
type Relation = {
	event_id?: number;
	song_id?: number;
	costume_id?: number;
	member_id: number;
};
type Response = {
	members: Member[];
	entities: Record<Kind, Entity[]>;
	relations: Record<Kind, Relation[]>;
};
const labels: Record<Kind, string> = {
	event: "イベント",
	song: "楽曲",
	costume: "衣装",
};
const entityId = (kind: Kind, item: Entity) =>
	Number(item[`${kind}_id` as keyof Entity]);
const entityName = (item: Entity) =>
	item.event_name ?? item.title ?? item.name ?? "名称未登録";
const entityDate = (item: Entity) =>
	item.date ??
	item.first_performed_date ??
	item.release_date ??
	item.debut_date ??
	"日付未登録";

export default function MemberRelationsPage() {
	const router = useRouter();
	const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
	const [data, setData] = useState<Response | null>(null);
	const [kind, setKind] = useState<Kind>("event");
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [memberIds, setMemberIds] = useState<number[]>([]);
	const [query, setQuery] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!authLoading && (!isLoggedIn || !isAdmin))
			void router.push(isLoggedIn ? "/milestones" : "/login?toast=login");
	}, [authLoading, isAdmin, isLoggedIn, router]);
	useEffect(() => {
		if (!isAdmin) return;
		authenticatedGet<Response>("/api/archive/member-relations")
			.then(setData)
			.catch((e: unknown) =>
				setError(
					e instanceof Error ? e.message : "関連データを取得できませんでした",
				),
			);
	}, [isAdmin]);
	const entities = useMemo(
		() =>
			(data?.entities[kind] ?? []).filter((item) =>
				`${entityName(item)} ${entityDate(item)}`
					.toLowerCase()
					.includes(query.toLowerCase()),
			),
		[data, kind, query],
	);
	const selectEntity = (id: number) => {
		setSelectedId(id);
		const key = `${kind}_id`;
		setMemberIds(
			(data?.relations[kind] ?? [])
				.filter((relation) => Number(relation[key as keyof Relation]) === id)
				.map((relation) => relation.member_id),
		);
	};
	const changeKind = (next: Kind) => {
		setKind(next);
		setSelectedId(null);
		setMemberIds([]);
		setQuery("");
	};
	const save = async () => {
		if (!selectedId) return;
		setSaving(true);
		try {
			await authenticatedPost("/api/archive/member-relations", {
				targetKind: kind,
				targetId: selectedId,
				memberIds,
			});
			setData((current) =>
				current
					? {
							...current,
							relations: {
								...current.relations,
								[kind]: [
									...current.relations[kind].filter(
										(relation) =>
											Number(relation[`${kind}_id` as keyof Relation]) !==
											selectedId,
									),
									...memberIds.map((member_id) => ({
										[`${kind}_id`]: selectedId,
										member_id,
									})),
								],
							},
						}
					: current,
			);
			toast.success("メンバー関連を保存しました");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "保存できませんでした");
		} finally {
			setSaving(false);
		}
	};
	if (authLoading || !isAdmin)
		return (
			<>
				<NextSeo title="メンバー関連の管理" />
				<DefaultLayout>
					<div className={styles.page}>
						<main className={styles.layout}>
							<div className={styles.empty}>権限を確認しています…</div>
						</main>
					</div>
				</DefaultLayout>
			</>
		);

	return (
		<>
			<NextSeo title="メンバー関連の管理" />
			<DefaultLayout>
				<div className={styles.page}>
					<header className={styles.hero}>
						<div>
							<Link href="/milestones">← 節目の管理へ</Link>
							<p>RELATION EDITOR</p>
							<h1>誰の思い出かを、事実で結ぶ。</h1>
							<span>
								明示的に登録した関連だけが、推しメン別タイムラインに反映されます。未選択はグループ全体の記録です。
							</span>
						</div>
					</header>
					<main className={styles.layout}>
						{error ? (
							<div className={styles.error}>{error}</div>
						) : !data ? (
							<div className={styles.empty}>読み込んでいます…</div>
						) : (
							<>
								<section className={styles.browser}>
									<div className={styles.tabs}>
										{(["event", "song", "costume"] as Kind[]).map((item) => (
											<button
												type="button"
												className={kind === item ? styles.active : ""}
												onClick={() => changeKind(item)}
												key={item}
											>
												{labels[item]}
											</button>
										))}
									</div>
									<input
										aria-label="記録を検索"
										placeholder={`${labels[kind]}名・日付で検索`}
										value={query}
										onChange={(e) => setQuery(e.target.value)}
									/>
									<div className={styles.entityList}>
										{entities.map((item) => {
											const id = entityId(kind, item);
											return (
												<button
													type="button"
													className={selectedId === id ? styles.selected : ""}
													onClick={() => selectEntity(id)}
													key={id}
												>
													<span>{entityDate(item)}</span>
													<b>{entityName(item)}</b>
												</button>
											);
										})}
									</div>
								</section>
								<section className={styles.editor}>
									{selectedId ? (
										<>
											<p>MEMBERS</p>
											<h2>
												{entityName(
													(data.entities[kind] ?? []).find(
														(item) => entityId(kind, item) === selectedId,
													) ?? {},
												)}
											</h2>
											<small>
												該当するメンバーを選択してください。0人の場合はグループ全体として表示します。
											</small>
											<div className={styles.members}>
												{data.members.map((member) => (
													<label key={member.member_id}>
														<input
															type="checkbox"
															checked={memberIds.includes(member.member_id)}
															onChange={(e) =>
																setMemberIds((current) =>
																	e.target.checked
																		? [...current, member.member_id]
																		: current.filter(
																				(id) => id !== member.member_id,
																			),
																)
															}
														/>
														{member.name}
													</label>
												))}
											</div>
											<button
												className={styles.save}
												type="button"
												disabled={saving}
												onClick={() => void save()}
											>
												{saving ? "保存中…" : "関連を保存"}
											</button>
										</>
									) : (
										<div className={styles.empty}>
											左から記録を選択してください。
										</div>
									)}
								</section>
							</>
						)}
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
