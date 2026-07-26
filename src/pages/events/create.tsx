import DefaultLayout from "@/components/layout/DefaultLayout";
import BaseButton from "@/components/ui/BaseButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import MiniTag from "@/components/ui/MiniTag";
import Tag from "@/components/ui/Tag";
import { useAuth } from "@/contexts/AuthContext";
import createEvent from "@/lib/supabase/createEvent";
import { getEventTags } from "@/lib/supabase/getEventTags";
import { uploadStorage } from "@/lib/supabase/uploadStorage";
import { supabase } from "@/lib/supabaseClient";
import { TagType } from "@/types/tag";
import { NextSeo } from "@/components/seo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const CreateEvent = () => {
	const { isLoggedIn, loading: authLoading } = useAuth();
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
	const [path, setPathName] = useState<string | undefined>();
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		//エラーをリセットする
		setErrorMessage("");
		if (!authLoading) {
			if (!isLoggedIn) {
				router.push(`/login?toast=login`);
			} else {
				fetchAllTags();
			}
		}
	}, [isLoggedIn, authLoading]);

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
		if (!folder || !folder.length) return null;
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

		if (isLoggedIn) {
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
			toast.error("ログインが必要です。");
		}
	};

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
				<div className="container mx-auto p-6 lg:max-w-3xl">
					<h1 className="text-2xl font-bold mb-8 text-font-color">
						イベントの作成
					</h1>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="eventName"
								className="block text-sm font-bold mb-2"
							>
								イベント名
								<MiniTag label="必須" />
							</label>
							<input
								id="eventName"
								type="text"
								value={eventName}
								onChange={(e) => setEventName(e.target.value)}
								className="bg-light-gray mb-6 py-3 px-4 block w-full border border-gray-200 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
							/>
						</div>
						<div>
							<label htmlFor="date" className="block text-sm font-bold mb-2">
								日付
								<MiniTag label="必須" />
							</label>
							<input
								id="date"
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								className="bg-light-gray mb-6 py-3 px-4 block w-full border border-gray-200 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
							/>
						</div>
						<div>
							<label
								htmlFor="location"
								className="block text-sm font-bold mb-2"
							>
								場所
							</label>
							<input
								id="location"
								type="text"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								className="bg-light-gray mb-6 py-3 px-4 block w-full border border-gray-200 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
							/>
						</div>
						<div>
							<label
								htmlFor="file-upload"
								className="block text-sm font-bold mb-2"
							>
								カバー画像
							</label>
							<input
								id="file-upload"
								name="file-upload"
								type="file"
								className=""
								accept="image/png, image/jpeg"
								onChange={handleFileChange}
							/>
							{previewUrl && <img src={previewUrl} alt="Preview" />}
						</div>
						<div>
							<label
								htmlFor="description"
								className="block text-sm font-bold mb-2"
							>
								説明文
							</label>
							<textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={4}
								className="bg-light-gray mb-6 py-3 px-4 block w-full border border-gray-200 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
							/>
						</div>
						<label className="block text-sm font-bold mb-2">タグ</label>
						<div className="flex flex-wrap gap-2 pb-8">
							{allTags.map((tag) => (
								<Tag
									key={tag.id}
									label={tag.label}
									selected={selectedTags.some((t) => t.id === tag.id)}
									onSelect={() => handleTagSelect(tag)}
								/>
							))}
						</div>
						{errorMessage && <p>{errorMessage}</p>}
						<div className="text-center">
							<BaseButton label="作成する" onClick={handleSubmit} />
						</div>
					</form>
				</div>
				{loading && <LoadingSpinner />}
			</DefaultLayout>
		</>
	);
};

export default CreateEvent;
