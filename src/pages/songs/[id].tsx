import ArchiveEntityDetail from "@/components/archive/ArchiveEntityDetail";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import { getSong } from "@/lib/supabase/getSongs";
import type { Song } from "@/types/archive";

export async function getServerSideProps({
	params,
}: {
	params: { id: string };
}) {
	const id = Number.parseInt(params.id, 10);
	if (!Number.isInteger(id)) return { notFound: true };
	try {
		const song = await getSong(id);
		return song ? { props: { song } } : { notFound: true };
	} catch (error) {
		console.error("Song record could not be loaded", error);
		return { notFound: true };
	}
}

export default function SongDetailPage({ song }: { song: Song }) {
	return (
		<>
			<NextSeo
				title={song.title}
				description={song.description || `${song.title}の出典付き楽曲記録`}
			/>
			<DefaultLayout>
				<ArchiveEntityDetail
					kind="song"
					title={song.title}
					date={song.first_performed_date || song.release_date}
					description={song.description}
					sources={song.song_sources || []}
					relations={song.song_events || []}
				/>
			</DefaultLayout>
		</>
	);
}
