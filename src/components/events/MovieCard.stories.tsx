import type { Meta, StoryFn } from "@storybook/react";
import MovieCard from "./MovieCard";

export default {
	title: "Components/MovieCard",
	component: MovieCard,
	parameters: {
		layout: "centered",
	},
} as Meta;

const Template: StoryFn<typeof MovieCard> = (args) => <MovieCard {...args} />;

export const Default = Template.bind({});
Default.args = {
	videoUrl: "https://youtu.be/4CeZnQPSurA?si=tDti0ssZD8MsEqGS",
};
