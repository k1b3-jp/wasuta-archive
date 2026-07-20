import { authenticatedPost } from "@/lib/api/authenticatedRequest";

export const deleteEvent = async (event_id: number) => {
	await authenticatedPost("/api/events/delete", { eventId: event_id });
};
