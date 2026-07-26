import type { Meta, StoryFn } from "@storybook/react";
import MiniTag from "./MiniTag";

export default {
	title: "Components/MiniTag",
	component: MiniTag,
} as Meta;

const Template: StoryFn<typeof MiniTag> = (args) => <MiniTag {...args} />;

export const Default = Template.bind({});
Default.args = {
	label: "DEFAULT",
};
