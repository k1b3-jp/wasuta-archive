import Link from "next/link";
import type { ChangeEventHandler, FormEventHandler } from "react";
import Tag from "@/components/ui/Tag";
import type { TagType } from "@/types/tag";
import styles from "./EventEditorForm.module.scss";

type Props = {
	mode: "create" | "edit";
	eventName: string;
	date: string;
	location: string;
	description: string;
	imageUrl?: string;
	previewUrl?: string;
	allTags: TagType[];
	selectedTagIds: number[];
	errorMessage?: string;
	loading: boolean;
	onEventNameChange: (value: string) => void;
	onDateChange: (value: string) => void;
	onLocationChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
	onFileChange: ChangeEventHandler<HTMLInputElement>;
	onTagSelect: (id: number) => void;
	onSubmit: FormEventHandler<HTMLFormElement>;
	onDelete?: () => void;
};

export default function EventEditorForm(props: Props) {
	const isEdit = props.mode === "edit";
	const visibleImage = props.previewUrl || props.imageUrl;
	return (
		<div className={styles.page}>
			<header className={styles.hero}>
				<div className={styles.heroInner}>
					<Link href={isEdit ? "/events" : "/events"} className={styles.back}>
						← イベント一覧へ
					</Link>
					<p>ARCHIVE EDITOR</p>
					<h1>
						{isEdit ? "イベントの記録を編集する" : "新しいイベントを記録する"}
					</h1>
					<span>
						{isEdit
							? "確認できる情報に基づいて、登録済みの記録を更新します。"
							: "日付とイベント名を起点に、映像や楽曲へつながる記録を作成します。"}
					</span>
				</div>
			</header>
			<main className={styles.layout}>
				<form className={styles.form} onSubmit={props.onSubmit}>
					<div className={styles.formHead}>
						<div>
							<p>EVENT RECORD</p>
							<h2>基本情報</h2>
						</div>
						<span>
							<i>*</i> 必須項目
						</span>
					</div>
					<div className={styles.field}>
						<label htmlFor="eventName">
							イベント名 <b>*</b>
						</label>
						<p>
							公式表記を確認し、会場名や公演部を含める場合は表記を揃えてください。
						</p>
						<input
							id="eventName"
							type="text"
							required
							value={props.eventName}
							onChange={(event) => props.onEventNameChange(event.target.value)}
						/>
					</div>
					<div className={styles.twoColumns}>
						<div className={styles.field}>
							<label htmlFor="date">
								開催日 <b>*</b>
							</label>
							<input
								id="date"
								type="date"
								required
								value={props.date}
								onChange={(event) => props.onDateChange(event.target.value)}
							/>
						</div>
						<div className={styles.field}>
							<label htmlFor="location">会場・場所</label>
							<input
								id="location"
								type="text"
								placeholder="例：Zepp DiverCity (TOKYO)"
								value={props.location}
								onChange={(event) => props.onLocationChange(event.target.value)}
							/>
						</div>
					</div>
					<div className={styles.field}>
						<label htmlFor="description">記録メモ</label>
						<p>
							初披露や公演内容など、出典で確認できる事実を記載します。URLは詳細ページでリンクになります。
						</p>
						<textarea
							id="description"
							rows={7}
							value={props.description}
							onChange={(event) =>
								props.onDescriptionChange(event.target.value)
							}
						/>
					</div>
					<fieldset className={styles.field}>
						<legend>イベントタグ</legend>
						<p>検索やタイムラインでこの記録を見つけるために使います。</p>
						<div className={styles.tags}>
							{props.allTags.map((tag) => (
								<Tag
									key={tag.id}
									label={tag.label}
									selected={props.selectedTagIds.includes(tag.id)}
									onSelect={() => props.onTagSelect(tag.id)}
								/>
							))}
						</div>
					</fieldset>
					{props.errorMessage && (
						<div className={styles.error} role="alert">
							{props.errorMessage}
						</div>
					)}
					<div className={styles.submitRow}>
						<Link href={isEdit && props.eventName ? "/events" : "/events"}>
							キャンセル
						</Link>
						<button type="submit" disabled={props.loading}>
							{props.loading
								? "保存中…"
								: isEdit
									? "変更を保存する"
									: "イベントを作成する"}
						</button>
					</div>
				</form>
				<aside className={styles.side}>
					<section className={styles.imagePanel}>
						<p>EVENT IMAGE</p>
						<h2>カバー画像</h2>
						<div className={styles.preview}>
							{visibleImage ? (
								<img src={visibleImage} alt="カバー画像プレビュー" />
							) : (
								<span>画像は任意です</span>
							)}
						</div>
						<label className={styles.fileButton} htmlFor="file-upload">
							画像を選択
						</label>
						<input
							id="file-upload"
							name="file-upload"
							type="file"
							accept="image/png,image/jpeg"
							onChange={props.onFileChange}
						/>
						<small>
							JPEGまたはPNG。画像の利用条件を確認してから登録してください。
						</small>
					</section>
					<section className={styles.checklist}>
						<p>BEFORE PUBLISHING</p>
						<h2>公開前の確認</h2>
						<ul>
							<li>日付とイベント名は出典と一致している</li>
							<li>推測を事実として記載していない</li>
							<li>画像の利用条件を確認している</li>
						</ul>
					</section>
					{isEdit && props.onDelete && (
						<section className={styles.danger}>
							<p>DANGER ZONE</p>
							<h2>この記録を削除</h2>
							<span>
								関連する動画の紐付けにも影響します。削除後は元に戻せません。
							</span>
							<button type="button" onClick={props.onDelete}>
								イベントを削除する
							</button>
						</section>
					)}
				</aside>
			</main>
		</div>
	);
}
