import { ThemeSupa } from "@supabase/auth-ui-shared";
import { NextSeo } from "@/components/seo";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/layout/DefaultLayout";
import supabase from "../lib/supabaseClient";

const Auth = dynamic(
	() => import("@supabase/auth-ui-react").then((module) => module.Auth),
	{ ssr: false },
);

export default function Google() {
    const router = useRouter();
    const toastParams = (router.query?.toast as string) || null;

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
