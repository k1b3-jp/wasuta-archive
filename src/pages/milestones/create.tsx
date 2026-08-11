import Link from "next/link";
import { useRouter } from "next/router";
import { type FormEvent, useEffect, useState } from "react";
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

type CreateResponse = { milestoneId: number };
type ManagedMilestone = {
	milestone_id: number;
	slug: string;
	title: string;
	kind: string;
	description: string | null;
	status: string;
	timeline_occurrences: Array<{
		occurred_on: string;
		is_group_wide: boolean;
		occurrence_sources: Array<{
			sources: { url: string; title: string; source_kind: string } | null;
		}>;
	}>;
};

export default function CreateMilestonePage() {
	const router = useRouter();
	const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [kind, setKind] = useState("group_history");
	const [occurredOn, setOccurredOn] = useState("");
	const [description, setDescription] = useState("");
	const [sourceTitle, setSourceTitle] = useState("");
	const [sourceUrl, setSourceUrl] = useState("");
	const [sourceKind, setSourceKind] = useState("official");
	const [isGroupWide, setIsGroupWide] = useState(true);
	const [confirmedFacts, setConfirmedFacts] = useState(false);
	const [saving, setSaving] = useState(false);
	const [createdId, setCreatedId] = useState<number | null>(null);
	const [published, setPublished] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const editId =
		typeof router.query.id === "string" ? Number(router.query.id) : null;
	const editing = Number.isSafeInteger(editId) && (editId ?? 0) > 0;
	const [loadingDraft, setLoadingDraft] = useState(false);
	const [editingPublished, setEditingPublished] = useState(false);
	const [revisionReason, setRevisionReason] = useState("");

	useEffect(() => {
		if (!authLoading && !isLoggedIn) {
			void router.push("/login?toast=login");
		}
	}, [authLoading, isLoggedIn, router]);

	useEffect(() => {
		if (!router.isReady || !editing || !isLoggedIn) return;
		setLoadingDraft(true);
		authenticatedGet<{ milestones: ManagedMilestone[] }>(
			`/api/milestones/manage?id=${editId}`,
		)
			.then(({ milestones }) => {
				const item = milestones[0];
				if (!item || !["draft", "published"].includes(item.status))
					throw new Error("編集できる節目が見つかりません");
				setEditingPublished(item.status === "published");
				const occurrence = item.timeline_occurrences[0];
				const source = occurrence?.occurrence_sources[0]?.sources;
				setCreatedId(item.milestone_id);
				setTitle(item.title);
				setSlug(item.slug);
				setKind(item.kind);
				setDescription(item.description ?? "");
				setOccurredOn(occurrence?.occurred_on ?? "");
				setIsGroupWide(occurrence?.is_group_wide ?? false);
				setSourceTitle(source?.title ?? "");
				setSourceUrl(source?.url ?? "");
				setSourceKind(source?.source_kind ?? "official");
			})
			.catch((error: unknown) =>
				setErrorMessage(
					error instanceof Error
						? error.message
						: "下書きを読み込めませんでした",
				),
			)
			.finally(() => setLoadingDraft(false));
	}, [editId, editing, isLoggedIn, router.isReady]);

	const createDraft = async () => {
		const response = await authenticatedPost<CreateResponse>(
			"/api/milestones/create",
			{
				title,
				slug,
				kind,
				occurredOn,
				description,
				sourceTitle,
				sourceUrl,
				sourceKind,
				isGroupWide,
			},
		);
		setCreatedId(response.milestoneId);
		return response.milestoneId;
	};

	const save = async (publishAfterConfirmation: boolean) => {
		setSaving(true);
		setErrorMessage("");
		try {
			let milestoneId = createdId;
			if (milestoneId) {
				await authenticatedPost("/api/milestones/update", {
					milestoneId,
					title,
					kind,
					description,
					occurredOn,
					sourceTitle,
					sourceUrl,
					sourceKind,
					isGroupWide,
					revisionReason: editingPublished ? revisionReason : undefined,
				});
			} else milestoneId = await createDraft();
			if (publishAfterConfirmation) {
				await authenticatedPost("/api/milestones/publish", { milestoneId });
				setPublished(true);
				toast.success("節目を公開しました");
			} else {
				toast.success("節目を下書き保存しました");
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "節目を保存できませんでした";
			setErrorMessage(message);
			toast.error("節目を保存できませんでした");
		} finally {
			setSaving(false);
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void save(false);
	};

	return (
		<>
			<NextSeo title="節目を記録" />
			<DefaultLayout>
				<div className={styles.page}>
					<header className={styles.hero}>
						<div className={styles.heroInner}>
							<Link href="/milestones" className={styles.back}>
								← 節目の管理へ
							</Link>
							<p>ARCHIVE EDITOR</p>
							<h1>
								{editingPublished
									? "公開中の節目を訂正する"
									: editing
										? "節目の下書きを編集する"
										: "新しい節目を記録する"}
							</h1>
							<span>
								確認できる事実と出典を一緒に保存し、内容を確認して公開します。
							</span>
						</div>
					</header>
					<main className={styles.layout}>
						<form className={styles.form} onSubmit={handleSubmit}>
							{loadingDraft && (
								<div className={milestoneStyles.saved}>
									下書きを読み込んでいます…
								</div>
							)}
							<div className={styles.formHead}>
								<div>
									<p>MILESTONE RECORD</p>
									<h2>節目と出典</h2>
								</div>
								<span>
									<i>*</i> 必須項目
								</span>
							</div>

							<div className={styles.field}>
								<label htmlFor="milestone-title">
									節目のタイトル <b>*</b>
								</label>
								<input
									id="milestone-title"
									required
									maxLength={200}
									value={title}
									onChange={(event) => setTitle(event.target.value)}
								/>
							</div>

							<div className={styles.twoColumns}>
								<div className={styles.field}>
									<label htmlFor="milestone-slug">
										固定slug <b>*</b>
									</label>
									<p>小文字英数字とハイフン。作成後は変更しません。</p>
									<input
										id="milestone-slug"
										required
										pattern="[a-z0-9]+(-[a-z0-9]+)*"
										placeholder="four-member-first-live"
										value={slug}
										disabled={editing}
										onChange={(event) => setSlug(event.target.value)}
									/>
								</div>
								<div className={styles.field}>
									<label htmlFor="milestone-date">
										発生日 <b>*</b>
									</label>
									<input
										id="milestone-date"
										type="date"
										required
										value={occurredOn}
										onChange={(event) => setOccurredOn(event.target.value)}
									/>
								</div>
							</div>

							<div className={styles.field}>
								<label htmlFor="milestone-kind">
									種別 <b>*</b>
								</label>
								<select
									className={milestoneStyles.select}
									id="milestone-kind"
									required
									value={kind}
									onChange={(event) => setKind(event.target.value)}
								>
									<option value="group_history">グループの歩み</option>
									<option value="anniversary">周年</option>
									<option value="member_history">メンバーの歩み</option>
									<option value="release">リリース</option>
								</select>
							</div>

							<div className={styles.field}>
								<label htmlFor="milestone-description">事実の説明</label>
								<textarea
									id="milestone-description"
									rows={6}
									value={description}
									onChange={(event) => setDescription(event.target.value)}
								/>
							</div>

							<div className={styles.field}>
								<label htmlFor="source-title">
									出典名 <b>*</b>
								</label>
								<input
									id="source-title"
									required
									value={sourceTitle}
									onChange={(event) => setSourceTitle(event.target.value)}
								/>
							</div>

							<div className={styles.twoColumns}>
								<div className={styles.field}>
									<label htmlFor="source-url">
										出典URL <b>*</b>
									</label>
									<input
										id="source-url"
										type="url"
										required
										placeholder="https://..."
										value={sourceUrl}
										onChange={(event) => setSourceUrl(event.target.value)}
									/>
								</div>
								<div className={styles.field}>
									<label htmlFor="source-kind">
										出典種別 <b>*</b>
									</label>
									<select
										className={milestoneStyles.select}
										id="source-kind"
										value={sourceKind}
										onChange={(event) => setSourceKind(event.target.value)}
									>
										<option value="official">公式サイト</option>
										<option value="video">公式動画</option>
										<option value="social">公式SNS</option>
										<option value="web">Webページ</option>
										<option value="book">書籍・冊子</option>
									</select>
								</div>
							</div>

							<div className={styles.field}>
								<label className={milestoneStyles.checkbox}>
									<input
										type="checkbox"
										checked={isGroupWide}
										onChange={(event) => setIsGroupWide(event.target.checked)}
									/>{" "}
									グループ全体の節目として扱う
								</label>
							</div>
							{editingPublished && (
								<div className={styles.field}>
									<label htmlFor="revision-reason">
										訂正理由 <b>*</b>
									</label>
									<p>公開履歴に保存されます。</p>
									<textarea
										id="revision-reason"
										required
										rows={3}
										maxLength={500}
										value={revisionReason}
										onChange={(event) => setRevisionReason(event.target.value)}
									/>
								</div>
							)}
							<div className={styles.field}>
								<label className={milestoneStyles.checkbox}>
									<input
										type="checkbox"
										checked={confirmedFacts}
										onChange={(event) =>
											setConfirmedFacts(event.target.checked)
										}
									/>
									入力内容・日付・出典URLを確認した
								</label>
							</div>

							{errorMessage && (
								<div className={styles.error} role="alert">
									{errorMessage}
								</div>
							)}
							{createdId && (
								<div className={milestoneStyles.saved} role="status">
									節目 #{createdId} を
									{published ? "公開済み" : "下書き保存済み"}です。
								</div>
							)}

							<div className={styles.submitRow}>
								<Link href="/milestones">キャンセル</Link>
								<button
									type="submit"
									disabled={saving || published || loadingDraft}
								>
									{saving
										? "保存中…"
										: editingPublished
											? "訂正を保存"
											: createdId
												? "変更を保存"
												: "下書き保存"}
								</button>
								{isAdmin && !editingPublished && (
									<button
										type="button"
										disabled={saving || published || !confirmedFacts}
										onClick={() => void save(true)}
									>
										{saving ? "公開中…" : "確認して公開"}
									</button>
								)}
							</div>
						</form>

						<aside className={styles.side}>
							<section className={styles.checklist}>
								<p>EDITORIAL POLICY</p>
								<h2>保存前の確認</h2>
								<ul>
									<li>タイトルと日付を同じ出典で確認できる</li>
									<li>推測や感想を事実として記載していない</li>
									<li>出典URLが公式・公開情報を指している</li>
								</ul>
							</section>
							<section className={styles.imagePanel}>
								<p>PUBLIC PREVIEW</p>
								<h2>{title || "節目のタイトル"}</h2>
								<div className={milestoneStyles.previewMeta}>
									{occurredOn || "発生日未入力"} · {kind}
								</div>
								<small className={milestoneStyles.workflowCopy}>
									{description || "事実の説明がここに表示されます。"}
								</small>
								{sourceUrl && (
									<a
										className={milestoneStyles.sourceLink}
										href={sourceUrl}
										target="_blank"
										rel="noreferrer"
									>
										出典：{sourceTitle || sourceUrl} ↗
									</a>
								)}
							</section>
						</aside>
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
