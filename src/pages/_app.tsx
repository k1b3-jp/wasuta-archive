import type { AppProps } from "next/app";
import Head from "next/head";
import PwaRegistration from "@/components/pwa/PwaRegistration";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<meta name="application-name" content="わーすたアーカイブ" />
				<meta name="theme-color" content="#29262d" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-translucent"
				/>
				<meta name="apple-mobile-web-app-title" content="わーすたアーカイブ" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, viewport-fit=cover"
				/>
				<link rel="manifest" href="/manifest.webmanifest" />
				<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
			</Head>
			<AuthProvider>
				<Component {...pageProps} />
				<PwaRegistration />
			</AuthProvider>
		</>
	);
}
