import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "@/components/events/EventEditorForm.module.scss";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import { useAuth } from "@/contexts/AuthContext";
import {
	authenticatedGet,
	authenticatedPost,
} from "@/lib/api/authenticatedRequest";
import milestoneStyles from "./milestoneEditor.module.scss";

type Milestone = {
	milestone_id: number;
	slug: string;
	title: string;
	kind: string;
	status: "draft" | "published" | "withdrawn";
	updated_at: string;
	timeline_occurrences: Array<{ occurred_on: string }>;
};
type AuditItem = {
	audit_id: number;
	action: string;
	from_status: string | null;
	to_status: string | null;
	reason: string | null;
	created_at: string;
};
const actionLabels: Record<string, string> = {
	create_draft: "下書き作成",
	update_draft: "下書き更新",
	submit_for_review: "内容確認",
	publish: "公開",
	withdraw: "取り下げ",
	revise_published: "公開内容の訂正",
	discard_draft: "下書き破棄",
};

export default function MilestoneManagementPage() {
	const router = useRouter();
	const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
	const [items, setItems] = useState<Record<string, Milestone[]>>({
		draft: [],
		published: [],
		withdrawn: [],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [audit, setAudit] = useState<Record<number, AuditItem[]>>({});
	const [openAuditId, setOpenAuditId] = useState<number | null>(null);
	const [withdrawId, setWithdrawId] = useState<number | null>(null);
	const [destructiveAction, setDestructiveAction] = useState<
		"withdraw" | "discard"
	>("withdraw");
	const [reason, setReason] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!authLoading && !isLoggedIn) void router.push("/login?toast=login");
	}, [authLoading, isLoggedIn, router]);
	const load = useCallback(async () => {
		if (!isLoggedIn) return;
		setLoading(true);
		setError("");
		try {
			const statuses = ["draft", "published", "withdrawn"] as const;
			const results = await Promise.all(
				statuses.map((status) =>
					authenticatedGet<{ milestones: Milestone[] }>(
						`/api/milestones/manage?status=${status}`,
					),
				),
			);
			setItems(
				Object.fromEntries(
					statuses.map((status, index) => [status, results[index].milestones]),
				),
			);
		} catch (e) {
			setError(e instanceof Error ? e.message : "節目を取得できませんでした");
		} finally {
			setLoading(false);
		}
	}, [isLoggedIn]);
	useEffect(() => {
		void load();
	}, [load]);

	const toggleAudit = async (id: number) => {
		if (openAuditId === id) {
			setOpenAuditId(null);
			return;
		}
		setOpenAuditId(id);
		if (audit[id] || !isAdmin) return;
		try {
			const response = await authenticatedGet<{ audit: AuditItem[] }>(
				`/api/milestones/audit?id=${id}`,
			);
			setAudit((current) => ({ ...current, [id]: response.audit }));
		} catch (e) {
			toast.error(
				e instanceof Error ? e.message : "履歴を取得できませんでした",
			);
		}
	};
	const applyDestructiveAction = async (id: number) => {
		setSubmitting(true);
		try {
			await authenticatedPost(`/api/milestones/${destructiveAction}`, {
				milestoneId: id,
				reason,
			});
			toast.success(
				destructiveAction === "withdraw"
					? "節目を取り下げました"
					: "下書きを破棄しました",
			);
			setWithdrawId(null);
			setReason("");
			setAudit({});
			await load();
		} catch (e) {
			toast.error(
				e instanceof Error ? e.message : "操作を完了できませんでした",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const renderCard = (item: Milestone) => (
		<article className={milestoneStyles.draftCard} key={item.milestone_id}>
			<div>
				<span>{item.timeline_occurrences[0]?.occurred_on ?? "日付未設定"}</span>
				<span>{item.kind}</span>
				<span>{item.status}</span>
			</div>
			<h3>{item.title}</h3>
			<p>/{item.slug}</p>
			<small>更新 {new Date(item.updated_at).toLocaleString("ja-JP")}</small>
			<div className={milestoneStyles.cardActions}>
				{item.status === "draft" && (
					<Link href={`/milestones/create?id=${item.milestone_id}`}>
						再編集・プレビュー →
					</Link>
				)}
				{isAdmin && item.status === "draft" && (
					<button
						className={milestoneStyles.withdrawButton}
						type="button"
						onClick={() => {
							setWithdrawId(item.milestone_id);
							setDestructiveAction("discard");
							setReason("");
						}}
					>
						破棄
					</button>
				)}
				{isAdmin && item.status === "published" && (
					<Link href={`/milestones/create?id=${item.milestone_id}`}>
						内容を訂正 →
					</Link>
				)}
				{isAdmin && (
					<button
						type="button"
						onClick={() => void toggleAudit(item.milestone_id)}
					>
						履歴{openAuditId === item.milestone_id ? "を閉じる" : "を見る"}
					</button>
				)}
				{isAdmin && item.status === "published" && (
					<button
						className={milestoneStyles.withdrawButton}
						type="button"
						onClick={() => {
							setWithdrawId(item.milestone_id);
							setDestructiveAction("withdraw");
							setReason("");
						}}
					>
						取り下げ
					</button>
				)}
			</div>
			{openAuditId === item.milestone_id && (
				<div className={milestoneStyles.audit}>
					{!audit[item.milestone_id] ? (
						<small>履歴を読み込んでいます…</small>
					) : (
						audit[item.milestone_id].map((entry) => (
							<div key={entry.audit_id}>
								<b>{actionLabels[entry.action] ?? entry.action}</b>
								<time>
									{new Date(entry.created_at).toLocaleString("ja-JP")}
								</time>
								{entry.reason && <p>理由：{entry.reason}</p>}
							</div>
						))
					)}
				</div>
			)}
			{withdrawId === item.milestone_id && (
				<div className={milestoneStyles.withdrawForm}>
					<label htmlFor={`reason-${item.milestone_id}`}>
						{destructiveAction === "withdraw" ? "取り下げ理由" : "破棄理由"}
						（履歴に保存されます）
					</label>
					<textarea
						id={`reason-${item.milestone_id}`}
						rows={3}
						maxLength={500}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
					<div>
						<button type="button" onClick={() => setWithdrawId(null)}>
							キャンセル
						</button>
						<button
							type="button"
							disabled={submitting || reason.trim().length < 3}
							onClick={() => void applyDestructiveAction(item.milestone_id)}
						>
							理由を記録して
							{destructiveAction === "withdraw" ? "取り下げ" : "破棄"}
						</button>
					</div>
				</div>
			)}
		</article>
	);

	return (
		<>
			<NextSeo title="節目の管理" />
			<DefaultLayout>
				<div className={styles.page}>
					<header className={styles.hero}>
						<div className={styles.heroInner}>
							<Link href="/timeline?year=2022" className={styles.back}>
								← 思い出タイムラインへ
							</Link>
							<p>ARCHIVE EDITOR</p>
							<h1>節目の管理</h1>
							<span>
								下書きから公開後の履歴まで、節目の状態をここで確認できます。
							</span>
						</div>
					</header>
					<main className={milestoneStyles.manage}>
						<div className={milestoneStyles.manageHead}>
							<div>
								<p>MILESTONES</p>
								<h2>記録した節目</h2>
							</div>
							{isAdmin && (
								<Link href="/archive/member-relations">メンバー関連</Link>
							)}
							{isAdmin && <Link href="/archive/manage">楽曲・衣装・出典</Link>}
							<Link href="/milestones/create">＋ 新しい節目</Link>
						</div>
						{loading && (
							<div className={milestoneStyles.empty}>読み込んでいます…</div>
						)}
						{error && <div className={styles.error}>{error}</div>}
						{!loading &&
							!error &&
							(["draft", "published", "withdrawn"] as const).map((status) => (
								<section className={milestoneStyles.statusSection} key={status}>
									<div className={milestoneStyles.sectionHead}>
										<h2>
											{status === "draft"
												? "下書き"
												: status === "published"
													? "公開中"
													: "取り下げ済み"}
										</h2>
										<span>{items[status].length}件</span>
									</div>
									{items[status].length ? (
										<div className={milestoneStyles.draftGrid}>
											{items[status].map(renderCard)}
										</div>
									) : (
										<div className={milestoneStyles.empty}>
											該当する節目はありません。
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
