import { NextSeo } from "next-seo";
import DefaultLayout from "../app/layout";

export default function Form() {
	return (
		<>
			<NextSeo
				title="お問い合わせ"
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
				<div className="mx-auto">
					<iframe
						src="https://docs.google.com/forms/d/e/1FAIpQLSe4IIT5kS5RmAIesiVc-yKAXDujSdI05lHi18SQbajStxuAQA/viewform?embedded=true"
						width="100%"
						height="980"
						frameBorder={0}
						marginHeight={0}
						marginWidth={0}
						scrolling="no"
					>
						読み込んでいます…
					</iframe>
				</div>
			</DefaultLayout>
		</>
	);
}
