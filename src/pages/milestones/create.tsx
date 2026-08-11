import Link from "next/link";
import { useRouter } from "next/router";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "@/components/events/EventEditorForm.module.scss";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedPost } from "@/lib/api/authenticatedRequest";
import milestoneStyles from "./milestoneEditor.module.scss";

type CreateResponse = { milestoneId: number };

export default function CreateMilestonePage() {
	const router = useRouter();
	const { isLoggedIn, loading: authLoading } = useAuth();
	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [kind, setKind] = useState("group_history");
	const [occurredOn, setOccurredOn] = useState("");
	const [description, setDescription] = useState("");
	const [sourceTitle, setSourceTitle] = useState("");
	const [sourceUrl, setSourceUrl] = useState("");
	const [sourceKind, setSourceKind] = useState("official");
	const [isGroupWide, setIsGroupWide] = useState(true);
	const [saving, setSaving] = useState(false);
	const [createdId, setCreatedId] = useState<number | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		if (!authLoading && !isLoggedIn) {
			void router.push("/login?toast=login");
		}
	}, [authLoading, isLoggedIn, router]);

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

	const save = async (requestReview: boolean) => {
		setSaving(true);
		setErrorMessage("");
		try {
			const milestoneId = createdId || (await createDraft());
			if (requestReview) {
				await authenticatedPost("/api/milestones/submit", { milestoneId });
				setSubmitted(true);
				toast.success("節目をレビュー依頼しました");
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
							<Link href="/timeline?year=2022" className={styles.back}>
								← 思い出タイムラインへ
							</Link>
							<p>ARCHIVE EDITOR</p>
							<h1>新しい節目を記録する</h1>
							<span>
								確認できる事実と出典を一緒に下書き保存し、公開前レビューへ送ります。
							</span>
						</div>
					</header>
					<main className={styles.layout}>
						<form className={styles.form} onSubmit={handleSubmit}>
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

							{errorMessage && (
								<div className={styles.error} role="alert">
									{errorMessage}
								</div>
							)}
							{createdId && (
								<div className={milestoneStyles.saved} role="status">
									節目 #{createdId} を
									{submitted ? "レビュー依頼済み" : "下書き保存済み"}です。
								</div>
							)}

							<div className={styles.submitRow}>
								<Link href="/timeline?year=2022">キャンセル</Link>
								<button type="submit" disabled={saving || createdId !== null}>
									{saving ? "保存中…" : "下書き保存"}
								</button>
								<button
									type="button"
									disabled={saving || submitted}
									onClick={() => void save(true)}
								>
									{saving ? "送信中…" : "レビュー依頼"}
								</button>
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
								<p>WORKFLOW</p>
								<h2>公開までの流れ</h2>
								<small className={milestoneStyles.workflowCopy}>
									下書き保存 → レビュー依頼 → reviewerが出典を検証 →
									公開。登録者が直接公開することはできません。
								</small>
							</section>
						</aside>
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
