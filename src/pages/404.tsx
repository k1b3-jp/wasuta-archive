import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";

const Player = dynamic(
	() => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
	{
		ssr: false,
		loading: () => <div>Loading...</div>,
	},
);

export default function Custom404() {
	return (
		<>
			<NextSeo
				title="404"
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
				<div className="px-4 pt-14 pb-4 text-center">
					<h1 className="text-2xl font-bold mb-8">ページが見つかりません😢</h1>
					<p className="mb-6">
						一時的にアクセスできない状況にあるか、移動もしくは削除された可能性があります。
					</p>
					<div className="lg:w-4/5 mx-auto">
                        <Player
                            autoplay
                            loop
                            src="https://lottie.host/81084f1d-3d95-40eb-93e8-d3abd149aa84/i6r6HoLdlM.json"
                            style={{ height: "100%", width: "100%" }}
                        />
					</div>
				</div>
			</DefaultLayout>
		</>
	);
}
