import formatDate from "@/utils/formatDate";
import type React from "react";
import type { EventCardProps } from "../../types/event";
import BaseButton from "../ui/BaseButton";
import Link from "next/link";

const defaultImageUrl = "/event-placeholder.png";

const EventCard: React.FC<EventCardProps> = ({
	title,
	location,
	date,
	imageUrl,
	id,
}) => {
	return (
		<div className="bg-white rounded-xl shadow-md overflow-hidden max-w-sm relative">
			<Link href={`/events/${id}`} rel="noopener noreferrer" target="_blank">
				<div className="overflow-hidden">
					<img
						src={imageUrl || defaultImageUrl}
						alt={title}
						width={340}
						height={208}
						className="hover:scale-110 transition-all duration-500 w-full h-52 object-cover"
					/>
				</div>
				<div className="absolute top-0 right-0 py-1 px-3 rounded-bl-lg bg-light-gray">
					{formatDate(date)}
				</div>
				<div className="p-4">
					<div className="mb-2">
						<div className="text-md font-semibold line-clamp-2 h-12">
							{title}
						</div>
					</div>
					<div className="text-sm text-gray-500 mb-6 line-clamp-1 leading-7 h-7">
						{location}
					</div>
					<BaseButton label="詳細を見る" />
				</div>
			</Link>
		</div>
	);
};

export default EventCard;
