import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import EventEditorForm from "@/components/events/EventEditorForm";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { deleteEvent } from "@/lib/supabase/deleteEvent";
import { deleteStorage } from "@/lib/supabase/deleteStorage";
import { getEvents } from "@/lib/supabase/getEvents";
import { getEventTags } from "@/lib/supabase/getEventTags";
import updateEvent from "@/lib/supabase/updateEvent"; // 既存のイベントを更新するための関数
import { uploadStorage } from "@/lib/supabase/uploadStorage";
import { supabase } from "@/lib/supabaseClient";
import type { TagType } from "@/types/tag";

const defaultImageUrl = "/event-placeholder.png";

const EditEvent = () => {
	const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
	const [eventName, setEventName] = useState("");
	const [date, setDate] = useState("");
	const [location, setLocation] = useState("");
	const [fileList, setFileList] = useState<FileList | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [description, setDescription] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [allTags, setAllTags] = useState<TagType[]>([]);
	const [selectedTags, setSelectedTags] = useState<number[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const router = useRouter();
	const id = router.query?.id;

	// biome-ignore lint/correctness/useExhaustiveDependencies: route id and auth transition control this initialization
	useEffect(() => {
		setErrorMessage("");
		if (!authLoading) {
			if (!isLoggedIn) {
				router.push("/login?toast=login");
			} else {
				fetchEventAndTags();
			}
		}
	}, [id, isLoggedIn, authLoading]);

	const fetchEventAndTags = async () => {
		if (id) {
			// 既存のイベントデータを取得
			const event = await getEvents({ eventId: Number(id) });
			setEventName(event[0].event_name);

			setDate(event[0].date);

			setLocation(event[0].location);
			setImageUrl(event[0].image_url);
			setDescription(event[0].description);

			// イベントに紐づくタグを取得
			const { data: eventTags } = await supabase
				.from("event_tags")
				.select("tag_id")
				.eq("event_id", id as any);
			if (eventTags) {
				const tagIds = eventTags.map((tag) => tag.tag_id);
				setSelectedTags(tagIds);
			}

			// タグを取得
			const tags = await getEventTags();
			setAllTags(tags ?? []);
		}
	};

	const handleTagSelect = (tag: number) => {
		if (selectedTags.includes(tag)) {
			setSelectedTags(selectedTags.filter((t) => t !== tag));
		} else {
			setSelectedTags([...selectedTags, tag]);
		}
	};

	const validateFields = (fields: {
		[x: string]: any;
		イベント名?: string;
		日付?: string;
	}) => {
		const errors = [];
		for (const fieldName in fields) {
			if (!fields[fieldName]) {
				errors.push(`${fieldName}は必須です。`);
			}
		}
		if (errors.length > 0) {
			setErrorMessage(errors.join(" "));
			return false;
		}
		return true;
	};

	// ファイルが選択された際の処理
	const handleFileChange = (e: any) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const file = files[0];
			setFileList(files); // ファイルリストの状態を更新

			const fileReader = new FileReader();
			fileReader.onloadend = () => {
				if (typeof fileReader.result === "string") {
					setPreviewUrl(fileReader.result); // 画像のプレビューURLを設定
				}
			};
			fileReader.readAsDataURL(file);
		} else {
			// ファイルが選択されていない場合、プレビューをクリア
			setPreviewUrl("");
			setFileList(null);
		}
	};

	const handleUploadStorage = async (folder: FileList | null) => {
		if (!folder?.length) return null;
		const { path } = await uploadStorage({
			folder,
			bucketName: "event_pics",
		});
		const { data } = supabase.storage.from("event_pics").getPublicUrl(path);
		return data.publicUrl;
	};

	function extractPathFromUrl(url: string | URL) {
		const urlParts = new URL(url);
		// URLのパス部分を取得し、'/'で分割
		const pathSegments = urlParts.pathname.split("/");

		// パスの最後のセグメントを取得
		const lastSegment = pathSegments[pathSegments.length - 1];

		return lastSegment;
	}

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		setLoading(true);

		if (isLoggedIn) {
			const fields = {
				イベント名: eventName,
				日付: date,
			};
			if (!validateFields(fields)) {
				setLoading(false);
				toast.error("不足項目があります😢");
				return;
			}

			try {
				let newPath: string | null = null;
				if (fileList) {
					newPath = await handleUploadStorage(fileList); // newPathに値を設定

					// 既存のimageUrlのファイルを削除
					if (imageUrl) {
						await deleteStorage(extractPathFromUrl(imageUrl), "event_pics");
					}
				}
				const eventData = {
					eventName,
					date,
					location,
					...(newPath ? { imageUrl: newPath } : {}),
					description,
				};

				await updateEvent(
					{
						...eventData,
					},
					(id as string) ?? "",
					selectedTags,
				);

				setLoading(false);
				router.push(`/events/${id}?toast=success`);
			} catch (error) {
				setLoading(false);
				toast.error("エラーがあります😢");
				console.error("Error updating event", error);
			}
		} else {
			setLoading(false);
			toast.error("ログインが必要です。");
		}
	};

	// イベントを削除する
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

	const openDialog = (eventId: number) => {
		if (eventId != null) {
			setSelectedEventId(eventId);
			setIsDialogOpen(true);
		}
	};

	const closeDialog = () => {
		setIsDialogOpen(false);
		setSelectedEventId(null);
	};

	const handleConfirm = async () => {
		if (selectedEventId) {
			try {
				await deleteEvent(selectedEventId);
				await router.push("/events?toast=eventDeleted");
			} catch (error) {
				console.error("An error occurred:", error);
				toast.error("イベントの削除中にエラーが発生しました。");
			}
			closeDialog();
		}
	};

	return (
		<>
			<NextSeo
				title="イベントの編集"
				openGraph={{
					images: [
						{
							url: imageUrl || process.env.defaultOgpImage || "",
							width: 1200,
							height: 630,
						},
					],
				}}
			/>
			<DefaultLayout>
				<EventEditorForm
					mode="edit"
					eventName={eventName}
					date={date}
					location={location}
					description={description}
					imageUrl={imageUrl || defaultImageUrl}
					previewUrl={previewUrl}
					allTags={allTags}
					selectedTagIds={selectedTags}
					errorMessage={errorMessage}
					loading={loading}
					onEventNameChange={setEventName}
					onDateChange={setDate}
					onLocationChange={setLocation}
					onDescriptionChange={setDescription}
					onFileChange={handleFileChange}
					onTagSelect={handleTagSelect}
					onSubmit={handleSubmit}
					onDelete={isAdmin ? () => openDialog(Number(id)) : undefined}
				/>
				<ConfirmDialog
					open={isDialogOpen}
					onClose={closeDialog}
					onConfirm={handleConfirm}
					title="イベントを削除しますか？"
					text="この操作は取り消せません。紐づく動画もすべて削除されます。"
					confirmText="削除する"
				/>
			</DefaultLayout>
		</>
	);
};

export default EditEvent;
