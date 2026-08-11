import {
	faArrowRight,
	faCalendarDays,
	faLink,
	faMusic,
	faShirt,
	faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import styles from "./about.module.scss";

const archives = [
	{
		label: "EVENTS",
		title: "イベント",
		copy: "日付、会場、説明を記録し、関連する映像へつなぎます。",
		href: "/events",
		icon: faCalendarDays,
	},
	{
		label: "MOVIES",
		title: "動画",
		copy: "公開されているYouTube映像を、イベントやタグから探せます。",
		href: "/movies",
		icon: faVideo,
	},
	{
		label: "SONGS",
		title: "楽曲",
		copy: "リリース日や初披露日を、確認できる出典とともに残します。",
		href: "/songs",
		icon: faMusic,
	},
	{
		label: "COSTUMES",
		title: "衣装",
		copy: "公式に確認できる衣装名と登場日を、出典から辿れます。",
		href: "/costumes",
		icon: faShirt,
	},
] as const;

const principles = [
	{
		number: "01",
		title: "確認できる事実だけを記す",
		copy: "日付、会場、初披露、衣装名などは、登録済みイベント情報や公式サイトなど、根拠を確認できる場合に掲載します。推測や記憶だけで事実を補いません。",
	},
	{
		number: "02",
		title: "出典へ戻れるようにする",
		copy: "楽曲と衣装の記録には、確認したページの名称、URL、確認日を保存します。閲覧者が元の情報を確認できる状態を目指します。",
	},
	{
		number: "03",
		title: "画像を無断で複製しない",
		copy: "利用条件を確認できない画像は転載せず、文字情報と公式出典で記録します。画像がないことより、出典が曖昧なことを避けます。",
	},
	{
		number: "04",
		title: "訂正できるアーカイブにする",
		copy: "誤り、リンク切れ、より確かな出典が見つかった場合は、問い合わせフォームから報告できます。記録は出典に基づいて更新します。",
	},
] as const;

export default function About() {
	return (
		<>
			<NextSeo
				title="わーすたアーカイブとは"
				description="わーすたのイベント、動画、楽曲、衣装を、確認できる出典とともに未来へ残す非公式ファンアーカイブです。"
			/>
			<DefaultLayout>
				<div className={styles.page}>
					<header className={styles.hero}>
						<div className={styles.heroInner}>
							<p className={styles.eyebrow}>ABOUT THE ARCHIVE</p>
							<h1>
								好きだった時間を、
								<br />
								<span>確かな記録にする。</span>
							</h1>
							<p className={styles.heroCopy}>
								わーすたアーカイブは、イベント、動画、楽曲、衣装をつなぎ、ファンが自分の思い出を辿り直せるようにする非公式の公開アーカイブです。
							</p>
							<div className={styles.heroActions}>
								<Link href="/timeline">
									思い出タイムラインをひらく{" "}
									<FontAwesomeIcon icon={faArrowRight} />
								</Link>
								<a href="#policy">掲載方針を読む</a>
							</div>
						</div>
					</header>
					<main>
						<section className={styles.mission}>
							<div className={styles.sectionHead}>
								<p>WHY WE ARCHIVE</p>
								<h2>記録は、思い出すための入口。</h2>
							</div>
							<div className={styles.missionGrid}>
								<p className={styles.lead}>
									ライブの日付を見て、その日の天気や帰り道まで思い出す。衣装の名前から、初めて観たステージへ戻る。そんな再発見の入口を残します。
								</p>
								<div className={styles.bodyCopy}>
									<p>
										情報を並べるだけではなく、同じ日にあったイベント、披露された楽曲、着用された衣装、残された映像を結びます。
									</p>
									<p>
										このサイトはファンによる非公式アーカイブであり、わーすたおよび所属事務所・関係各社が運営する公式サイトではありません。
									</p>
								</div>
							</div>
						</section>
						<section className={styles.explore}>
							<div className={styles.sectionHead}>
								<p>WHAT WE KEEP</p>
								<h2>4つの記録を、同じ時間軸へ。</h2>
							</div>
							<div className={styles.archiveGrid}>
								{archives.map((archive) => (
									<Link
										href={archive.href}
										key={archive.label}
										className={styles.archiveCard}
									>
										<FontAwesomeIcon icon={archive.icon} />
										<p>{archive.label}</p>
										<h3>{archive.title}</h3>
										<span>{archive.copy}</span>
										<i>→</i>
									</Link>
								))}
							</div>
						</section>
						<section className={styles.policy} id="policy">
							<div className={styles.policyIntro}>
								<p>EDITORIAL POLICY</p>
								<h2>掲載と出典について</h2>
								<span>後から検証できることを、公開記録の基準にします。</span>
							</div>
							<div className={styles.principles}>
								{principles.map((principle) => (
									<article key={principle.number}>
										<p>{principle.number}</p>
										<div>
											<h3>{principle.title}</h3>
											<span>{principle.copy}</span>
										</div>
									</article>
								))}
							</div>
						</section>
						<section className={styles.correction}>
							<div>
								<p>CORRECTIONS & SOURCES</p>
								<h2>誤りや、新しい出典を見つけたら。</h2>
								<span>
									対象ページのURLと、確認できる出典を添えてお知らせください。
								</span>
							</div>
							<Link href="/form">
								記録について連絡する <FontAwesomeIcon icon={faLink} />
							</Link>
							<a href="/api/archive/export.csv">公開記録をCSVで保存</a>
						</section>
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
