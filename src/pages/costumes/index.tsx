import Link from "next/link";
import type { CSSProperties } from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import { getCostumes } from "@/lib/supabase/getCostumes";
import styles from "@/styles/archiveEntity.module.scss";
import type { Costume } from "@/types/archive";
import formatDate from "@/utils/formatDate";

export async function getServerSideProps() {
	try {
		return { props: { costumes: await getCostumes() } };
	} catch (error) {
		console.error("Costume archive could not be loaded", error);
		return { props: { costumes: [] } };
	}
}

export default function CostumesPage({ costumes }: { costumes: Costume[] }) {
	return (
		<>
			<NextSeo
				title="衣装アーカイブ"
				description="公式出典を確認できるわーすたの衣装記録。衣装とステージの関係を辿れます。"
			/>
			<DefaultLayout>
				<div
					className={styles.page}
					style={
						{
							"--archive-hero":
								"linear-gradient(125deg,#252229,#46344f 58%,#75618a)",
							"--archive-accent": "#d8b9df",
						} as CSSProperties
					}
				>
					<header className={styles.hero}>
						<div className={styles.inner}>
							<p className={styles.eyebrow}>COSTUME ARCHIVE</p>
							<h1>ステージを彩った、もうひとつの記憶。</h1>
							<p className={styles.heroCopy}>
								公式に確認できる衣装名と登場日を、出典とともに残します。画像を転載できない記録も、事実から丁寧に辿れます。
							</p>
						</div>
					</header>
					<main className={styles.contents}>
						<div className={styles.head}>
							<div>
								<p>VERIFIED RECORDS</p>
								<h2>衣装の記録</h2>
							</div>
							<span>{costumes.length}着</span>
						</div>
						<div className={styles.grid}>
							{costumes.length === 0 && (
								<div className={styles.empty}>
									公式出典を確認できた衣装を準備しています。
									<br />
									画像の有無にかかわらず、事実を確認できた記録だけを公開します。
								</div>
							)}
							{costumes.map((costume, index) => (
								<Link
									key={costume.costume_id}
									href={`/costumes/${costume.costume_id}`}
									className={styles.card}
								>
									{costume.image_url && (
										<img
											className={styles.cardImage}
											src={costume.image_url}
											alt=""
										/>
									)}
									<div className={styles.cardBody}>
										<p className={styles.index}>
											COSTUME — {String(index + 1).padStart(3, "0")}
										</p>
										<h3>{costume.name}</h3>
										<p className={styles.date}>
											{costume.debut_date
												? `確認日 ${formatDate(costume.debut_date)}`
												: "日付確認中"}
										</p>
										<div className={styles.source}>
											<span>
												{costume.costume_sources?.[0]?.label || "出典情報"}
											</span>
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
