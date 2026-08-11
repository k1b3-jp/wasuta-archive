import Link from "next/link";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import styles from "./form.module.scss";

export default function Form() {
	return (
		<>
			<NextSeo
				title="お問い合わせ"
				description="わーすたアーカイブの記録の訂正、新しい出典、サイトへのお問い合わせはこちらから。"
			/>
			<DefaultLayout>
				<div className={styles.page}>
					<header className={styles.hero}>
						<div>
							<p>CONTACT THE ARCHIVE</p>
							<h1>記録を、より確かなものへ。</h1>
							<span>
								誤りの訂正、リンク切れ、新しい出典、その他のお問い合わせを受け付けています。
							</span>
						</div>
					</header>
					<main className={styles.content}>
						<aside>
							<p className={styles.label}>BEFORE SENDING</p>
							<h2>記録について連絡する場合</h2>
							<ol>
								<li>
									<span>01</span>
									<p>対象となるページのURL</p>
								</li>
								<li>
									<span>02</span>
									<p>訂正したい箇所、または追加したい内容</p>
								</li>
								<li>
									<span>03</span>
									<p>確認できる公式ページなどの出典URL</p>
								</li>
							</ol>
							<p className={styles.note}>
								いただいた情報は出典を確認したうえで反映を判断します。掲載方針は
								<Link href="/about#policy">こちら</Link>をご確認ください。
							</p>
						</aside>
						<section
							className={styles.formWrap}
							aria-label="お問い合わせフォーム"
						>
							<iframe
								title="わーすたアーカイブ お問い合わせフォーム"
								src="https://docs.google.com/forms/d/e/1FAIpQLSe4IIT5kS5RmAIesiVc-yKAXDujSdI05lHi18SQbajStxuAQA/viewform?embedded=true"
								width="100%"
								height="1080"
								frameBorder={0}
							>
								読み込んでいます…
							</iframe>
						</section>
					</main>
				</div>
			</DefaultLayout>
		</>
	);
}
