import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import EventEditorForm from "@/components/events/EventEditorForm";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { NextSeo } from "@/components/seo";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import createEvent from "@/lib/supabase/createEvent";
import { getEventTags } from "@/lib/supabase/getEventTags";
import { uploadStorage } from "@/lib/supabase/uploadStorage";
import { supabase } from "@/lib/supabaseClient";
import type { TagType } from "@/types/tag";

const CreateEvent = () => {
	const { isAdmin, loading: authLoading } = useAuth();
	const [eventName, setEventName] = useState("");
	const [date, setDate] = useState("");
	const [location, setLocation] = useState("");
	const [description, setDescription] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [allTags, setAllTags] = useState<TagType[]>([]);
	const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
	const router = useRouter();
	const [fileList, setFileList] = useState<FileList | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [loading, setLoading] = useState<boolean>(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: auth transition controls this initialization
	useEffect(() => {
		//エラーをリセットする
		setErrorMessage("");
		if (!authLoading) {
			if (!isAdmin) {
				router.replace("/events");
			} else {
				fetchAllTags();
			}
		}
	}, [isAdmin, authLoading, router]);

	const fetchAllTags = async () => {
		const tags = await getEventTags();
		if (tags) {
			setAllTags(tags);
		}
	};

	const handleTagSelect = (tag: TagType) => {
		if (selectedTags.some((t) => t.id === tag.id)) {
			setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
		} else {
			setSelectedTags([...selectedTags, tag]);
		}
	};

	// Validation function
	type Fields = {
		[key: string]: string;
	};
	const validateFields = (fields: Fields) => {
		let isValid = true;
		for (const fieldName in fields) {
			if (!fields[fieldName]) {
				toast.error(`${fieldName}は必須です😥`);
				isValid = false;
			}
		}
		return isValid;
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

	// Handle form submission
	const handleSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		setLoading(true);

		if (isAdmin) {
			// Check if required fields are filled
			const fields = {
				イベント名: eventName,
				日付: date,
			};
			if (!validateFields(fields)) {
				setLoading(false);
				return;
			}

			try {
				const newPath = await handleUploadStorage(fileList);
				const eventData = {
					eventName,
					date,
					location,
					imageUrl: newPath || undefined,
					description,
				};
				const selectedTagIds = selectedTags.map((tag) => tag.id);
				const insertedData = await createEvent(eventData, selectedTagIds);
				const id = insertedData[0].event_id;
				setLoading(false);
				router.push(`/events/${id}?toast=success`);
			} catch (error) {
				if ((error as any).code === "23505") {
					setLoading(false);
					toast.error(
						"そのイベント名は既に存在します。別の名前を試してください🙇‍♂️",
					);
				} else {
					setLoading(false);
					toast.error(`エラーがあります😢`);
				}
			}
		} else {
			setLoading(false);
			toast.error("管理者権限が必要です。");
		}
	};

	if (authLoading || !isAdmin) {
		return (
			<DefaultLayout>
				<LoadingSpinner />
			</DefaultLayout>
		);
	}

	return (
		<>
			<NextSeo
				title="イベント作成"
				openGraph={{
					images: [
						{
							url: process.env.defaultOgpImage || "",
							width: 1200,
							height: 630,
							alt: "Og Image Alt",
						},
					],
				}}
			/>
			<DefaultLayout>
				<EventEditorForm
					mode="create"
					eventName={eventName}
					date={date}
					location={location}
					description={description}
					previewUrl={previewUrl}
					allTags={allTags}
					selectedTagIds={selectedTags.map((tag) => tag.id)}
					errorMessage={errorMessage}
					loading={loading}
					onEventNameChange={setEventName}
					onDateChange={setDate}
					onLocationChange={setLocation}
					onDescriptionChange={setDescription}
					onFileChange={handleFileChange}
					onTagSelect={(tagId) => {
						const tag = allTags.find((item) => item.id === tagId);
						if (tag) handleTagSelect(tag);
					}}
					onSubmit={handleSubmit}
				/>
			</DefaultLayout>
		</>
	);
};

export default CreateEvent;
