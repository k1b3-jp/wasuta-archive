import type { Meta, StoryFn } from "@storybook/react";
import LoadingSpinner from "./LoadingSpinner";

export default {
	title: "Components/LoadingSpinner",
	component: LoadingSpinner,
} as Meta;

const Template: StoryFn<typeof LoadingSpinner> = (args) => (
	<LoadingSpinner {...args} />
);

export const Default = Template.bind({});
