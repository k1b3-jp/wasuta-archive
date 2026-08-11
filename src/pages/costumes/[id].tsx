import ArchiveEntityDetail from "@/components/archive/ArchiveEntityDetail";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import { getCostume } from "@/lib/supabase/getCostumes";
import type { Costume } from "@/types/archive";

export async function getServerSideProps({
	params,
}: {
	params: { id: string };
}) {
	const id = Number.parseInt(params.id, 10);
	if (!Number.isInteger(id)) return { notFound: true };
	try {
		const costume = await getCostume(id);
		return costume ? { props: { costume } } : { notFound: true };
	} catch (error) {
		console.error("Costume record could not be loaded", error);
		return { notFound: true };
	}
}

export default function CostumeDetailPage({ costume }: { costume: Costume }) {
	return (
		<>
			<NextSeo
				title={costume.name}
				description={costume.description || `${costume.name}の出典付き衣装記録`}
			/>
			<DefaultLayout>
				<ArchiveEntityDetail
					kind="costume"
					title={costume.name}
					date={costume.debut_date}
					description={costume.description}
					sources={costume.costume_sources || []}
					relations={costume.costume_events || []}
				/>
			</DefaultLayout>
		</>
	);
}
