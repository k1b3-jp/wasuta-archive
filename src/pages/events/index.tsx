import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useSWRInfinite from "swr/infinite";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import Tag from "@/components/ui/Tag";
import { useClearQueryParam } from "@/hooks/useClearQueryParam";
import { getEvents } from "@/lib/supabase/getEvents";
import { getEventTags } from "@/lib/supabase/getEventTags";
import styles from "@/styles/archiveList.module.scss";
import type { TagType } from "@/types/tag";
import formatDate from "@/utils/formatDate";

const defaultImageUrl = "/event-placeholder.png";

export default function EventListPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [allTags, setAllTags] = useState<TagType[]>([]);
	const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();
	const toastParam = (router.query?.toast as string) || null;
	useClearQueryParam("toast", toastParam === "eventDeleted");

	useEffect(() => {
		getEventTags().then((tags) => tags && setAllTags(tags));
		if (toastParam === "eventDeleted") toast.success("イベントを削除しました");
	}, [toastParam]);

	useEffect(() => {
		const ids = ((router.query?.tags as string) || "")
			.split(",")
			.filter(Boolean)
			.map(Number);
		setSelectedTags(allTags.filter((tag) => ids.includes(Number(tag.id))));
	}, [allTags, router.query?.tags]);

	const fetchEvents = async ({
		page,
		limit,
	}: {
		page: number;
		limit: number;
	}) => {
		setLoading(true);
		setError("");
		try {
			return await getEvents({
				keyword: searchTerm,
				startDate,
				endDate,
				tags: selectedTags.map((tag) => tag.id),
				start: page * limit,
				end: page * limit + limit - 1,
				pagination: true,
			});
		} catch (err) {
			console.error(err);
			setError("イベントの取得中にエラーが発生しました");
			return [];
		} finally {
			setLoading(false);
		}
	};

	const { data, size, setSize, mutate } = useSWRInfinite(
		(pageIndex, previousPageData: any[]) =>
			previousPageData && !previousPageData.length
				? null
				: { page: pageIndex, limit: 12 },
		fetchEvents,
	);
	const events = useMemo(
		() => data?.flatMap((page) => page || []) || [],
		[data],
	);
	const search = async () => {
		await setSize(1);
		await mutate();
	};
	const toggleTag = (tag: TagType) =>
		setSelectedTags((current) =>
			current.some((item) => item.id === tag.id)
				? current.filter((item) => item.id !== tag.id)
				: [...current, tag],
		);

	return (
		<>
			<NextSeo title="イベント一覧" />
			<DefaultLayout>
				<div className={styles.page}>
					<header className={styles.hero}>
						<div className={styles.heroInner}>
							<p className={styles.eyebrow}>EVENT ARCHIVE</p>
							<h1>あの日の景色を、探しにいく。</h1>
							<p className={styles.heroCopy}>
								ライブ、リリースイベント、フェス。日付と場所を手がかりに、わーすたの歩みを辿れます。
							</p>
						</div>
					</header>
					<section
						className={styles.filters}
						aria-labelledby="event-filter-title"
					>
						<div className={styles.filterInner}>
							<div className={styles.filterTop}>
								<h2 id="event-filter-title">記録を絞り込む</h2>
								<span>タイトル・期間・タグから検索</span>
							</div>
							<div className={styles.filterGrid}>
								<div className={styles.field}>
									<label htmlFor="event-keyword">タイトル</label>
									<input
										id="event-keyword"
										type="search"
										placeholder="イベント名を入力"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && search()}
									/>
								</div>
								<div className={styles.field}>
									<p>開催期間</p>
									<div className={styles.dateRow}>
										<input
											aria-label="開始日"
											type="date"
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
										/>
										<span>—</span>
										<input
											aria-label="終了日"
											type="date"
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
										/>
									</div>
								</div>
								<div className={`${styles.field} ${styles.tagField}`}>
									<p>タグ</p>
									<div className={styles.tags}>
										{allTags.map((tag) => (
											<Tag
												key={tag.id}
												label={tag.label}
												selected={selectedTags.some(
													(item) => item.id === tag.id,
												)}
												onSelect={() => toggleTag(tag)}
											/>
										))}
									</div>
								</div>
								<div className={styles.action}>
									<button
										type="button"
										className={styles.searchButton}
										onClick={search}
										disabled={loading}
									>
										この条件で探す <span>→</span>
									</button>
								</div>
							</div>
						</div>
					</section>
					<main className={styles.content}>
						<div className={styles.resultHead}>
							<div>
								<p>ARCHIVE RECORDS</p>
								<h2>イベントの記録</h2>
							</div>
							<span>{events.length}件を表示中</span>
						</div>
						<div className={styles.grid}>
							{error && <div className={styles.status}>{error}</div>}
							{!error && !events.length && loading && (
								<div className={styles.status}>記録を読み込んでいます…</div>
							)}
							{!error && !events.length && !loading && (
								<div className={styles.status}>
									条件に合うイベントは見つかりませんでした。
								</div>
							)}
							{events.map((event: any) => (
								<Link
									key={event.event_id}
									href={`/events/${event.event_id}`}
									className={styles.eventCard}
								>
									<div className={styles.eventImage}>
										<img src={event.image_url || defaultImageUrl} alt="" />
										<span className={styles.dateBadge}>
											{formatDate(event.date)}
										</span>
									</div>
									<div className={styles.eventBody}>
										<p>EVENT RECORD</p>
										<h3>{event.event_name}</h3>
										<div className={styles.eventMeta}>
											<span>{event.location || "場所の記録なし"}</span>
											<span aria-hidden="true">↗</span>
										</div>
									</div>
								</Link>
							))}
						</div>
						{events.length > 0 && (
							<div className={styles.more}>
								<button
									type="button"
									className={styles.moreButton}
									onClick={() => setSize(size + 1)}
									disabled={loading}
								>
									{loading ? "読み込み中…" : "さらに記録を見る"}
								</button>
							</div>
						)}
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
