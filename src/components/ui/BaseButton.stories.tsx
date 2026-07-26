import type { Meta, StoryFn } from "@storybook/react";
import BaseButton from "./BaseButton";

export default {
	title: "Components/BaseButton",
	component: BaseButton,
	argTypes: { onClick: { action: "clicked" } },
} as Meta;

const Template: StoryFn<typeof BaseButton> = (args) => <BaseButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {
	label: "Apply Filters",
	onClick: () => {},
	disabled: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
	label: "Apply Filters",
	onClick: () => {},
	disabled: true,
};
