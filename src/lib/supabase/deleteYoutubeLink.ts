import { authenticatedPost } from "@/lib/api/authenticatedRequest";

export const deleteYoutubeLink = async (
	youtubeLinkId: number,
	eventId: number,
) => {
	await authenticatedPost("/api/youtube/delete", { youtubeLinkId, eventId });
};

export default deleteYoutubeLink;
