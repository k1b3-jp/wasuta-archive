import { authenticatedPost } from "@/lib/api/authenticatedRequest";

export const deleteStorage = async (path: string, bucketName: string) => {
	await authenticatedPost("/api/storage/delete", { path, bucketName });
	return true;
};
