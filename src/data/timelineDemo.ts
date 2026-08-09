export type TimelineKind = "event" | "song" | "costume" | "video" | "milestone";

export type TimelineSource = {
	label: string;
	url?: string;
};

export type TimelineDemoItem = {
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

export const demoArchiveItems: TimelineDemoItem[] = [
	{
		id: "milestone-four-members",
		kind: "milestone",
		date: "2022-01-10",
		title: "4人体制初のワンマンライブ",
		summary:
			"「The World Standard〜改めまして、わーすたです!〜」を開催。既存イベント情報に4人体制初のワンマンライブとして記録されています。",
		members: members.map((member) => member.slug),
		isGroupWide: true,
		sources: [{ label: "登録済みイベント情報" }],
		href: "/events/118",
	},
	{
		id: "song-miraibaru",
		kind: "song",
		date: "2022-01-10",
		title: "「ミライバルダンス」初披露",
		summary:
			"4人体制初のワンマンライブ第1部で初披露されたことが、既存イベント情報に記録されています。",
		members: members.map((member) => member.slug),
		isGroupWide: true,
		sources: [{ label: "登録済みイベント情報" }],
		href: "/events/118",
	},
	{
		id: "costume-miraibaru",
		kind: "costume",
		date: "2022-03-26",
		title: "ミライバルダンス衣装",
		summary:
			"7周年ライブの公式グッズで「ミライバルダンス衣装ver.」という衣装名が確認できます。画像は転載せず、公式ページを出典として表示しています。",
		members: members.map((member) => member.slug),
		isGroupWide: true,
		sources: [
			{
				label: "わーすた公式グッズ",
				url: "https://wa-suta.world/goods/items.php?id=1001982",
			},
		],
	},
];
