import { authenticatedPost } from "@/lib/api/authenticatedRequest";

interface EventData {
	eventName: string;
	date: string;
	location?: string;
	imageUrl?: string;
	description?: string;
}

const updateEvent = async (
	data: EventData,
	eventId: string,
	tags: number[],
) => {
	const { eventName, date, location, imageUrl, description } = data;
	await authenticatedPost("/api/events/update", {
		eventId,
		eventName,
		date,
		location,
		imageUrl,
		description,
		tags,
	});
	return true;
};

export default updateEvent;
