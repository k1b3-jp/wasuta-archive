import BottomBar from "@/components/navigation/BottomBar";
import Footer from "@/components/navigation/Footer";
import NavBar from "@/components/navigation/NavBar";
import "@/styles/globals.scss";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DefaultSeo } from "next-seo";
import { Noto_Sans_JP } from "next/font/google";
import type React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

config.autoAddCss = false;

const noto = Noto_Sans_JP({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<DefaultSeo
				titleTemplate="%s | わーすたアーカイブ"
				description="わーすたアーカイブはわーすたの動画がイベント毎に見つかるサイトです。タグで過去のライブを探したり、年表表示で歴史を振り返ることができます。"
				openGraph={{
					type: "website",
					description:
						"わーすたアーカイブはわーすたの動画がイベント毎に見つかるサイトです。タグで過去のライブを探したり、年表表示で歴史を振り返ることができます。",
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
				style={{
					margin: 0,
				}}
				className={`${noto.className} flex flex-col min-h-screen`}
				id="top"
			>
				<NavBar />
				<main className="flex-grow">
					<div className="container mx-auto">{children}</div>
				</main>
				<BottomBar />
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
				<Analytics />
				<SpeedInsights />
			</div>
		</>
	);
}
