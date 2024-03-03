import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import DefaultLayout from "../app/layout";
import supabase from "../lib/supabaseClient";

export default function Google() {
	const query = useSearchParams();
	const toastParams = query?.get("toast");

	useEffect(() => {
		if (toastParams === "login") {
			toast.error("ログインが必要です🙇‍♂️");
		}
	}, [toastParams]);

	return (
		<>
			<NextSeo
				title="ログイン"
				openGraph={{
					images: [
						{
							url: process.env.defaultOgpImage || "",
							width: 1200,
							height: 630,
							alt: "Og Image Alt",
						},
					],
				}}
			/>
			<DefaultLayout>
				<div className="py-4 px-8">
					<Auth
						supabaseClient={supabase}
						appearance={{ theme: ThemeSupa }}
						providers={["google"]}
					/>
				</div>
				<p className="text-sm text-center">
					サインアップすることで、
					<Link href="/terms" className="underline">
						利用規約
					</Link>
					および
					<Link href="/policy" className="underline">
						プライバシーポリシー
					</Link>
					に同意したことになります。
				</p>
			</DefaultLayout>
		</>
	);
}
