import { Meta, Story } from "@storybook/react";
import React from "react";
import MovieCard from "./MovieCard";

export default {
	title: "Components/MovieCard",
	component: MovieCard,
	parameters: {
		layout: "centered",
	},
} as Meta;

const Template: Story<typeof MovieCard> = (args) => <MovieCard {...args} />;

export const Default = Template.bind({});
Default.args = {
	videoUrl: "https://youtu.be/4CeZnQPSurA?si=tDti0ssZD8MsEqGS",
};
