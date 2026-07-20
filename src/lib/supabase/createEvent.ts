import { authenticatedPost } from "@/lib/api/authenticatedRequest";

interface EventData {
	eventName: string;
	date: string;
	location?: string;
	imageUrl?: string;
	description: string;
}

interface CreatedEvent {
	event_id: number;
}

const createEvent = async (data: EventData, tags: number[]) => {
	const { eventName, date, location, imageUrl, description } = data;
	const body = await authenticatedPost<{ data: CreatedEvent[] }>(
		"/api/events/create",
		{
			eventName,
			date,
			location,
			imageUrl,
			description,
			tags,
		},
	);
	return body.data;
};

export default createEvent;
