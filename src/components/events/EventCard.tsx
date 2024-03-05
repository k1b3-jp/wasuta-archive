import formatDate from "@/utils/formatDate";
import React from "react";
import Image from "next/image";
import { EventCardProps } from "../../types/event";
import BaseButton from "../ui/BaseButton";

const defaultImageUrl = "/event-placeholder.png";

const EventCard: React.FC<EventCardProps> = ({
  title,
  location,
  date,
  imageUrl,
  id,
}) => {
  return (
    <div className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden max-w-sm relative">
      <Image
        src={imageUrl || defaultImageUrl}
        alt={title}
        width="320"
        height="208"
        className="w-full h-52 object-cover"
      />
      <div className="absolute top-0 right-0 py-1 px-3 rounded-bl-lg bg-light-gray">
        {formatDate(date)}
      </div>
      <div className="p-4">
        <div className="mb-4">
          <div className="text-lg font-semibold line-clamp-2 min-h-14">
            {title}
          </div>
        </div>
        <div className="text-gray-500 mb-6 line-clamp-1 min-h-6">
          {location}
        </div>
        <BaseButton label="詳細を見る" link={`/events/${id}`} />
      </div>
    </div>
  );
};

export default EventCard;
