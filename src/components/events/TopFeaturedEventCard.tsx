import formatDate from "@/utils/formatDate";
import type React from "react";
import type { EventCardProps } from "../../types/event";
import BaseButton from "../ui/BaseButton";
import EventCard from "./EventCard";
import Link from "next/link";

const defaultImageUrl = "/event-placeholder.png";

const TopFeaturedEventCard: React.FC<EventCardProps> = ({
  title,
  location,
  date,
  imageUrl,
  id,
}) => {
  return (
    <div className="bg-white rounded-lg w-full relative">
      <Link href={`/events/${id}`}>
        <div className="overflow-hidden h-52 lg:h-80">
          <img
            src={imageUrl || defaultImageUrl}
            alt={title}
            className="hover:scale-110 transition-all duration-500 w-full h-full object-cover object-center"
          />
        </div>
        <div className="p-4">
          <div className="mb-2">
            <div className="text-lg font-semibold line-clamp-2 min-h-14">
              {title}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-gray-500 line-clamp-1 min-h-6">{location}</div>
            <div className="text-gray-500 line-clamp-1 min-h-6">
              {formatDate(date)}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TopFeaturedEventCard;
