import React from 'react';
import { Story, Meta } from '@storybook/react';
import Tag from './Tag';

export default {
  title: 'Components/Tag',
  component: Tag,
} as Meta;

const Template: Story<typeof Tag> = (args) => <Tag {...args} />;

export const Selected = Template.bind({});
Selected.args = {
  label: 'SELECTED',
  selected: true,
  onSelect: () => {},
};

export const Unselected = Template.bind({});
Unselected.args = {
  label: 'UNSELECTED',
  selected: false,
  onSelect: () => {},
};
