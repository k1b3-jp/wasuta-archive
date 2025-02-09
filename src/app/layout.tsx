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

interface DefaultLayoutProps {
	children: React.ReactNode;
	hideHeader?: boolean;
	hideBottomNav?: boolean;
}

const DefaultLayout = ({ children, hideHeader, hideBottomNav }: DefaultLayoutProps) => {
	return (
		<div className="min-h-screen">
			{!hideHeader && <NavBar />}
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
			<Analytics />
			<SpeedInsights />
		</div>
	);
};

export default DefaultLayout;
