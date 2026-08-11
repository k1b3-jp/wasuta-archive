import BottomBar from "@/components/navigation/BottomBar";
import Footer from "@/components/navigation/Footer";
import NavBar from "@/components/navigation/NavBar";
import "@/styles/tailwind.css";
import "@/styles/globals.scss";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Noto_Sans_JP } from "next/font/google";
import type React from "react";
import { ToastContainer } from "react-toastify";
import { DefaultSeo } from "@/components/seo";
import "react-toastify/dist/ReactToastify.css";

config.autoAddCss = false;

const noto = Noto_Sans_JP({ subsets: ["latin"] });

export default function DefaultLayout({
	children,
	hideBottomNav,
}: {
	children: React.ReactNode;
	hideBottomNav?: boolean;
}) {
	const analyticsEnabled = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
	return (
		<>
			<DefaultSeo
				titleTemplate="%s | わーすたアーカイブ"
				description="イベント、動画、楽曲、衣装をつなぎ、わーすたの歩みを確認できる出典とともに未来へ残す非公式ファンアーカイブです。"
				openGraph={{
					type: "website",
					description:
						"イベント、動画、楽曲、衣装をつなぎ、わーすたの歩みを確認できる出典とともに未来へ残す非公式ファンアーカイブです。",
					site_name: "わーすたアーカイブ",
					url: "https://www.wasuta-archive.com/",
				}}
				twitter={{
					handle: "tws_kotaro",
					site: "tws_kotaro",
					cardType: "summary_large_image",
				}}
			/>
			<div
				style={{ margin: 0 }}
				className={`${noto.className} flex flex-col min-h-screen`}
				id="top"
			>
				<NavBar />
				<main className="flex-grow">
					<div className="container mx-auto">{children}</div>
				</main>
				{!hideBottomNav && <BottomBar />}
				<Footer />
				<ToastContainer
					position="top-center"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
				/>
				{analyticsEnabled && <Analytics />}
				{analyticsEnabled && <SpeedInsights />}
			</div>
		</>
	);
}
