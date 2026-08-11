import { ThemeSupa } from "@supabase/auth-ui-shared";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import supabase from "@/lib/supabaseClient";
import styles from "./login.module.scss";

const Auth = dynamic(
	() => import("@supabase/auth-ui-react").then((module) => module.Auth),
	{ ssr: false },
);

export default function LoginPage() {
	const router = useRouter();
	const toastParam = (router.query?.toast as string) || null;
	useEffect(() => {
		if (toastParam === "login") toast.error("編集にはログインが必要です");
	}, [toastParam]);
	return (
		<>
			<NextSeo title="編集者ログイン" noindex />
			<DefaultLayout>
				<div className={styles.page}>
					<section className={styles.intro}>
						<div>
							<Link href="/">← アーカイブへ戻る</Link>
							<p>ARCHIVE EDITOR</p>
							<h1>記録を未来へつなぐ、編集入口。</h1>
							<span>
								イベントや映像の登録・修正を行う編集者向けのログイン画面です。
							</span>
						</div>
						<ul>
							<li>
								<b>01</b>
								<p>確認できる出典に基づいて編集する</p>
							</li>
							<li>
								<b>02</b>
								<p>推測を事実として登録しない</p>
							</li>
							<li>
								<b>03</b>
								<p>画像の利用条件を確認する</p>
							</li>
						</ul>
					</section>
					<section className={styles.authPanel}>
						<div>
							<p>EDITOR SIGN IN</p>
							<h2>ログイン</h2>
							<span>登録済みのGoogleアカウントを使用してください。</span>
						</div>
						<Auth
							supabaseClient={supabase}
							appearance={{
								theme: ThemeSupa,
								variables: {
									default: {
										colors: { brand: "#29262d", brandAccent: "#554d57" },
										radii: {
											borderRadiusButton: "999px",
											buttonBorderRadius: "999px",
											inputBorderRadius: "10px",
										},
									},
								},
							}}
							providers={["google"]}
						/>
						<p className={styles.legal}>
							ログインすることで、<Link href="/terms">利用規約</Link>および
							<Link href="/policy">プライバシーポリシー</Link>
							に同意したものとみなされます。
						</p>
					</section>
				</div>
			</DefaultLayout>
		</>
	);
}
