import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "@/components/events/EventEditorForm.module.scss";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedGet } from "@/lib/api/authenticatedRequest";
import milestoneStyles from "./milestoneEditor.module.scss";

type Draft = {
	milestone_id: number;
	slug: string;
	title: string;
	kind: string;
	updated_at: string;
	timeline_occurrences: Array<{ occurred_on: string }>;
};

export default function MilestoneManagementPage() {
	const router = useRouter();
	const { isLoggedIn, loading: authLoading } = useAuth();
	const [drafts, setDrafts] = useState<Draft[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	useEffect(() => {
		if (!authLoading && !isLoggedIn) void router.push("/login?toast=login");
	}, [authLoading, isLoggedIn, router]);
	useEffect(() => {
		if (!isLoggedIn) return;
		authenticatedGet<{ milestones: Draft[] }>("/api/milestones/manage")
			.then(({ milestones }) => setDrafts(milestones))
			.catch((e: unknown) =>
				setError(
					e instanceof Error ? e.message : "下書きを取得できませんでした",
				),
			)
			.finally(() => setLoading(false));
	}, [isLoggedIn]);
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
								保存した下書きを再編集し、公開前の見え方と出典を確認できます。
							</span>
						</div>
					</header>
					<main className={milestoneStyles.manage}>
						<div className={milestoneStyles.manageHead}>
							<div>
								<p>DRAFTS</p>
								<h2>保存済みの下書き</h2>
							</div>
							<Link href="/milestones/create">＋ 新しい節目</Link>
						</div>
						{loading && (
							<div className={milestoneStyles.empty}>読み込んでいます…</div>
						)}
						{error && <div className={styles.error}>{error}</div>}
						{!loading && !error && drafts.length === 0 && (
							<div className={milestoneStyles.empty}>
								下書きはありません。新しい節目を記録できます。
							</div>
						)}
						<div className={milestoneStyles.draftGrid}>
							{drafts.map((draft) => (
								<article
									className={milestoneStyles.draftCard}
									key={draft.milestone_id}
								>
									<div>
										<span>
											{draft.timeline_occurrences[0]?.occurred_on ??
												"日付未設定"}
										</span>
										<span>{draft.kind}</span>
									</div>
									<h3>{draft.title}</h3>
									<p>/{draft.slug}</p>
									<small>
										更新 {new Date(draft.updated_at).toLocaleString("ja-JP")}
									</small>
									<Link href={`/milestones/create?id=${draft.milestone_id}`}>
										再編集・プレビュー →
									</Link>
								</article>
							))}
						</div>
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
