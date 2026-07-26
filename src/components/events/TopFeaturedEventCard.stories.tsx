import type { Meta, StoryFn } from "@storybook/react";
import TopFeaturedEventCard from "./TopFeaturedEventCard";
import type EventCard from "./EventCard";

export default {
	title: "Components/TopFeaturedEventCard",
	component: TopFeaturedEventCard,
	parameters: {
		layout: "centered",
	},
} as Meta;

const Template: StoryFn<typeof EventCard> = (args) => (
	<TopFeaturedEventCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
	title: "イベントタイトル",
	location: "イベント開催場所",
	date: "JUL 04",
	imageUrl: "https://wa-suta.world/assets/img/top/img_mainvisual.jpg?20231127",
};
