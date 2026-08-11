import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./LegalDocument.module.scss";

export default function LegalDocument({
	title,
	label,
	children,
}: {
	title: string;
	label: string;
	children: ReactNode;
}) {
	return (
		<div className={styles.page}>
			<header className={styles.hero}>
				<div>
					<Link href="/about">← このサイトについて</Link>
					<p>{label}</p>
					<h1>{title}</h1>
					<span>わーすたアーカイブの運営に関する文書です。</span>
				</div>
			</header>
			<div className={styles.layout}>
				<aside>
					<p>DOCUMENTS</p>
					<nav>
						<Link href="/terms">利用規約</Link>
						<Link href="/policy">プライバシーポリシー</Link>
						<Link href="/about#policy">掲載・出典方針</Link>
						<Link href="/form">お問い合わせ</Link>
					</nav>
				</aside>
				<article className={styles.document}>{children}</article>
			</div>
		</div>
	);
}
