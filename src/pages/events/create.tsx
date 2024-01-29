import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import DefaultLayout from '@/app/layout';
import createEvent from '@/lib/supabase/createEvent';
import { getEventTags } from '@/lib/supabase/getEventTags';
import Tag from '@/components/ui/Tag';
import BaseButton from '@/components/ui/BaseButton';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { uploadStorage } from '@/lib/supabase/uploadStorage';
import { TagType } from '@/types/tag';

const CreateEvent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const router = useRouter();
  const [fileList, setFileList] = useState<FileList | null>(null);
  const [path, setPathName] = useState<string | undefined>();

  const validateAccess = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session !== null) {
      setIsLoggedIn(true);
    } else {
      router.push(`/login?toast=login`);
    }
  };

  useEffect(() => {
    //エラーをリセットする
    setErrorMessage('');
    validateAccess();
    fetchAllTags();
  }, []);

  const fetchAllTags = async () => {
    const tags = await getEventTags();
    setAllTags(tags);
  };

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 日付と時刻をISO 8601形式に変換します
  let combinedDateTime: string | null = null;
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

  // Validation function
  const validateFields = (fields) => {
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

  const handleUploadStorage = async (folder: FolderList | null) => {
    if (!folder || !folder.length) return null;
    const { path } = await uploadStorage({
      folder,
      bucketName: 'event_pics',
    });
    const { data } = supabase.storage.from('event_pics').getPublicUrl(path);
    return data.publicUrl;
  };

  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (isLoggedIn) {
      // Check if required fields are filled
      const fields = {
        イベント名: eventName,
        日付: date,
      };
      if (!validateFields(fields)) {
        toast.error('不足項目があります😢');
        return;
      }

      try {
        const newPath = await handleUploadStorage(fileList);
        const eventData = {
          eventName,
          eventTime: combinedDateTime,
          date,
          location,
          imageUrl: newPath || undefined,
          description,
        };
        const insertedData = await createEvent(eventData, selectedTags);
        const id = insertedData[0].event_id;
        router.push(`/events/${id}?toast=success`);
      } catch (error) {
        toast.error('エラーがあります😢');
      }
    } else {
      toast.error('ログインが必要です。');
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-10">
        <h1 className="text-2xl font-bold mb-8 text-deep-pink">
          イベントの作成
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="eventName" className="block text-sm font-bold mb-2">
              イベント名
            </label>
            <input
              id="eventName"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="mb-6 py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-bold mb-2">
              日付
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mb-6 py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none"
            />
          </div>
          <div>
            <label htmlFor="eventTime" className="block text-sm font-bold mb-2">
              時刻
            </label>
            <input
              id="eventTime"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="mb-6 py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-bold mb-2">
              場所
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mb-6 py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none"
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
              onChange={(e) => setFileList(e.target?.files)}
            />
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
              className="mb-6 py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none"
            />
          </div>
          <label className="block text-sm font-bold mb-2">タグ</label>
          <div className="flex flex-wrap gap-2 pb-8">
            {allTags.map((tag) => (
              <Tag
                key={tag.id} // タグのIDをkeyプロパティとして使用
                label={tag.label} // タグの名前をlabelプロパティとして使用
                selected={selectedTags.includes(tag.id)}
                onSelect={() => handleTagSelect(tag.id)}
              />
            ))}
          </div>
          {errorMessage && <p>{errorMessage}</p>}
          <BaseButton label="作成する" onClick={handleSubmit} />
        </form>
      </div>
    </DefaultLayout>
  );
};

export default CreateEvent;
