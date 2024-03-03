import { Meta, Story } from "@storybook/react";
import React from "react";
import MiniTag from "./MiniTag";

export default {
	title: "Components/MiniTag",
	component: MiniTag,
} as Meta;

const Template: Story<typeof MiniTag> = (args) => <MiniTag {...args} />;

export const Default = Template.bind({});
Default.args = {
	label: "DEFAULT",
};
