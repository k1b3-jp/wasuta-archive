import Link from "next/link";
import type { CSSProperties } from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import { getSongs } from "@/lib/supabase/getSongs";
import styles from "@/styles/archiveEntity.module.scss";
import type { Song } from "@/types/archive";
import formatDate from "@/utils/formatDate";

export async function getServerSideProps() {
	try {
		return { props: { songs: await getSongs() } };
	} catch (error) {
		console.error("Song archive could not be loaded", error);
		return { props: { songs: [] } };
	}
}

export default function SongsPage({ songs }: { songs: Song[] }) {
	return (
		<>
			<NextSeo
				title="楽曲アーカイブ"
				description="出典を確認できるわーすたの楽曲記録。リリース日や初披露日から歩みを辿れます。"
			/>
			<DefaultLayout>
				<div
					className={styles.page}
					style={
						{
							"--archive-hero":
								"linear-gradient(125deg,#252229,#5e304e 62%,#a85f88)",
							"--archive-accent": "#f2a2c8",
						} as CSSProperties
					}
				>
					<header className={styles.hero}>
						<div className={styles.inner}>
							<p className={styles.eyebrow}>SONG ARCHIVE</p>
							<h1>歌から、時間を巻き戻す。</h1>
							<p className={styles.heroCopy}>
								リリースと初披露を、確認できる出典とともに記録します。楽曲からライブや映像へ、記憶をつなぐアーカイブです。
							</p>
						</div>
					</header>
					<main className={styles.contents}>
						<div className={styles.head}>
							<div>
								<p>VERIFIED RECORDS</p>
								<h2>楽曲の記録</h2>
							</div>
							<span>{songs.length}曲</span>
						</div>
						<div className={styles.grid}>
							{songs.length === 0 && (
								<div className={styles.empty}>
									出典を確認できた楽曲を準備しています。
									<br />
									確認できた事実だけを順次公開します。
								</div>
							)}
							{songs.map((song, index) => (
								<Link
									key={song.song_id}
									href={`/songs/${song.song_id}`}
									className={styles.card}
								>
									{song.image_url && (
										<img
											className={styles.cardImage}
											src={song.image_url}
											alt=""
										/>
									)}
									<div className={styles.cardBody}>
										<p className={styles.index}>
											SONG — {String(index + 1).padStart(3, "0")}
										</p>
										<h3>{song.title}</h3>
										<p className={styles.date}>
											{song.first_performed_date
												? `初披露 ${formatDate(song.first_performed_date)}`
												: song.release_date
													? `リリース ${formatDate(song.release_date)}`
													: "日付確認中"}
										</p>
										<div className={styles.source}>
											<span>{song.song_sources?.[0]?.label || "出典情報"}</span>
											<span>→</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
