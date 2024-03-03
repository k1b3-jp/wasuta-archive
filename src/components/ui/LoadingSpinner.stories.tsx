import { Meta, Story } from "@storybook/react";
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

export default {
	title: "Components/LoadingSpinner",
	component: LoadingSpinner,
} as Meta;

const Template: Story<typeof LoadingSpinner> = (args) => (
	<LoadingSpinner {...args} />
);

export const Default = Template.bind({});
