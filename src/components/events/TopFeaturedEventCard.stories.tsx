import type { Meta, Story } from "@storybook/react";
import React from "react";
import TopFeaturedEventCard from "./TopFeaturedEventCard";
import type EventCard from "./EventCard";

export default {
  title: "Components/TopFeaturedEventCard",
  component: TopFeaturedEventCard,
  parameters: {
    layout: "centered",
  },
} as Meta;

const Template: Story<typeof EventCard> = (args) => (
  <TopFeaturedEventCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
  title: "イベントタイトル",
  location: "イベント開催場所",
  date: "JUL 04",
  imageUrl: "https://wa-suta.world/assets/img/top/img_mainvisual.jpg?20231127",
};
