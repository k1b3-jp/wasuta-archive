import type { GetServerSideProps } from "next";
import ExhibitRoom from "@/components/museum/ExhibitRoom";
import { loadExhibit } from "@/lib/museum/load";
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
	} catch {
		return { props: { exhibit: null } };
	}
};
export default function ExhibitPage({ exhibit }: { exhibit: Exhibit | null }) {
	return <ExhibitRoom exhibit={exhibit} />;
}
