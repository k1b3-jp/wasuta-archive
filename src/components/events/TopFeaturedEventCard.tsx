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
		<div className="bg-white rounded-lg shadow-md w-full relative my-5">
			<Link href={`/events/${id}`} rel="noopener noreferrer" target="_blank">
				<div className="rounded-t-lg overflow-hidden h-56 md:h-70 lg:h-96">
					<img
						src={imageUrl || defaultImageUrl}
						alt={title}
						className="hover:scale-110 transition-all duration-500 w-full h-full object-cover object-center"
					/>
				</div>
				<div className="p-4">
					<div className="mb-2">
						<div className="text-base font-semibold line-clamp-2 min-h-12">
							{title}
						</div>
					</div>
					<div className="flex justify-between text-sm">
						<div className="text-gray-500 line-clamp-1 min-h-6">{location}</div>
						<div className="text-gray-500 line-clamp-1 min-h-6 min-w-[74px]">
							{formatDate(date)}
						</div>
					</div>
				</div>
			</Link>
		</div>
	);
};

export default TopFeaturedEventCard;
