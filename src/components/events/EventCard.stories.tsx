// stories/EventCard.stories.tsx

import type { Meta, StoryFn } from "@storybook/react";
import EventCard from "./EventCard";

export default {
	title: "Components/EventCard",
	component: EventCard,
	parameters: {
		layout: "centered",
	},
} as Meta;

const Template: StoryFn<typeof EventCard> = (args) => <EventCard {...args} />;

export const Default = Template.bind({});
Default.args = {
	title: "イベントタイトル",
	location: "イベント開催場所",
	date: "JUL 04",
	imageUrl: "http://placekitten.com/500/240",
};
