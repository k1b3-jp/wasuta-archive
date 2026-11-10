import type { GetServerSideProps } from "next";
import ExhibitRoom from "@/components/museum/ExhibitRoom";
import { isMissingMuseumRelation, loadExhibit } from "@/lib/museum/load";
import type { Exhibit } from "@/lib/museum/model";
export const getServerSideProps: GetServerSideProps = async ({
	params,
	res,
}) => {
	res.setHeader("Cache-Control", "private, no-store");
	const value = String(params?.id ?? "");
	if (value !== "167") return { notFound: true };
	try {
		const exhibit = await loadExhibit(Number(value));
		return exhibit ? { props: { exhibit } } : { notFound: true };
	} catch (error) {
		const cause = (error as { cause?: { code?: string; message?: string } })
			.cause;
		// The museum tables are not on the database yet. Hide the room instead of
		// showing a load failure.
		if (isMissingMuseumRelation(cause)) return { notFound: true };
		return { props: { exhibit: null } };
	}
};
export default function ExhibitPage({ exhibit }: { exhibit: Exhibit | null }) {
	return <ExhibitRoom exhibit={exhibit} />;
}
