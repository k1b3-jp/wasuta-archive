export type TimelineKind = "event" | "song" | "costume" | "video" | "milestone";

export type TimelineSource = {
	label: string;
	url?: string;
};

export type TimelineItem = {
	id: string;
	kind: TimelineKind;
	date: string;
	title: string;
	summary: string;
	members: string[];
	isGroupWide: boolean;
	sources: TimelineSource[];
	href?: string;
};

export const members = [
	{ slug: "nanase", name: "廣川奈々聖", shortName: "奈々聖", color: "#8abf92" },
	{ slug: "miri", name: "松田美里", shortName: "美里", color: "#c6a4c6" },
	{ slug: "ririka", name: "小玉梨々華", shortName: "梨々華", color: "#7ec8d9" },
	{ slug: "ruka", name: "三品瑠香", shortName: "瑠香", color: "#f2a2c8" },
] as const;

export const timelineYears = Array.from(
	{ length: 12 },
	(_, index) => 2015 + index,
);
