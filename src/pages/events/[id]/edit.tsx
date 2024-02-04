import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DefaultLayout from '@/app/layout';
import Tag from '@/components/ui/Tag';
import { deleteStorage } from '@/lib/supabase/deleteStorage';
import { getEvents } from '@/lib/supabase/getEvents';
import { getEventTags } from '@/lib/supabase/getEventTags';
import updateEvent from '@/lib/supabase/updateEvent'; // 既存のイベントを更新するための関数
import { uploadStorage } from '@/lib/supabase/uploadStorage';
import { supabase } from '@/lib/supabaseClient';
import { TagType } from '@/types/tag';

const defaultImageUrl = '/event-placeholder.png';

const EditEvent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [fileList, setFileList] = useState<FileList | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const validateAccess = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session !== null) {
      setIsLoggedIn(true);
    } else {
      router.push(`/login?toast=login`);
    }
  };

  useEffect(() => {
    setErrorMessage('');
    validateAccess();
    fetchEventAndTags();
  }, [id]);

  const fetchEventAndTags = async () => {
    if (id) {
      // 既存のイベントデータを取得
      const event = await getEvents({ eventId: Number(id) });
      setEventName(event[0].event_name);

      // ISO 8601形式の日付時間から時間部分のみを取得
      if (event[0].event_time) {
        let timePart = event[0].event_time.split('T')[1].split(':');
        let formattedTime = `${timePart[0]}:${timePart[1]}`;
        setEventTime(formattedTime);
      }

      setDate(event[0].date);

      setLocation(event[0].location);
      setImageUrl(event[0].image_url);
      setDescription(event[0].description);

      // イベントに紐づくタグを取得
      const { data: eventTags } = await supabase
        .from('event_tags')
        .select('tag_id')
        .eq('event_id', id);
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
    let errors = [];
    for (let fieldName in fields) {
      if (!fields[fieldName]) {
        errors.push(`${fieldName}は必須です。`);
      }
    }
    if (errors.length > 0) {
      setErrorMessage(errors.join(' '));
      return false;
    }
    return true;
  };

  const handleUploadStorage = async (folder: FileList | null) => {
    if (!folder || !folder.length) return null;
    const { path } = await uploadStorage({
      folder,
      bucketName: 'event_pics',
    });
    const { data } = supabase.storage.from('event_pics').getPublicUrl(path);
    return data.publicUrl;
  };

  function extractPathFromUrl(url: string | URL) {
    const urlParts = new URL(url);
    // URLのパス部分を取得し、'/'で分割
    const pathSegments = urlParts.pathname.split('/');

    // パスの最後のセグメントを取得
    const lastSegment = pathSegments[pathSegments.length - 1];

    return lastSegment;
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isLoggedIn) {
      const fields = {
        イベント名: eventName,
        日付: date,
      };
      if (!validateFields(fields)) {
        toast.error('不足項目があります😢');
        return;
      }

      let combinedDateTime = null;
      if (date && eventTime) {
        let [year, month, day] = date.split('-');
        let [hour, minute] = eventTime.split(':');
        combinedDateTime = new Date(
          Date.UTC(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
          ),
        ).toISOString();
      }

      try {
        let newPath;
        if (fileList) {
          newPath = await handleUploadStorage(fileList); // newPathに値を設定
          // 既存のimageUrlのファイルを削除
          let deletePics;
          if (imageUrl) {
            deletePics = await deleteStorage(
              extractPathFromUrl(imageUrl),
              'event_pics',
            );
          }
        }
        const eventData = {
          eventName,
          eventTime: combinedDateTime,
          date,
          location,
          description,
          ...(newPath ? { imageUrl: newPath } : {}),
        };
        const updatedData = await updateEvent(
          {
            ...eventData,
            eventTime: eventData.eventTime || undefined,
          },
          id?.toString() ?? '',
          selectedTags,
        );
        router.push(`/events/${id}?toast=success`);
      } catch (error) {
        toast.error('エラーがあります😢');
        console.error('Error updating event', error);
      }
    } else {
      toast.error('ログインが必要です。');
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 各フォーム要素 */}
          <div>
            <label
              htmlFor="eventName"
              className="block text-sm font-medium text-gray-700"
            >
              Event Name
            </label>
            <input
              id="eventName"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="eventTime"
              className="block text-sm font-medium text-gray-700"
            >
              Event Time
            </label>
            <input
              id="eventTime"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-bold mb-2"
            >
              カバー画像
            </label>
            <Image
              src={imageUrl || defaultImageUrl}
              alt={eventName}
              width={500}
              height={300}
              className="mx-auto"
            />
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className=""
              accept="image/png, image/jpeg"
              onChange={(e) => setFileList(e.target?.files)}
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>
          <div className="flex flex-wrap gap-2 my-4">
            {allTags.map((tag) => (
              <Tag
                key={tag.id}
                label={tag.label}
                selected={selectedTags.includes(parseInt(tag.id))}
                onSelect={() => handleTagSelect(parseInt(tag.id))}
              />
            ))}
          </div>
          {errorMessage && <p>{errorMessage}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Update Event
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default EditEvent;
