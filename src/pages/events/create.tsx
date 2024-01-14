import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import DefaultLayout from '@/app/layout';
import createEvent from '@/lib/supabase/createEvent';
import { getEventTags } from '@/lib/supabase/getEventTags';
import Tag from '@/components/ui/Tag';
import BaseButton from '@/components/ui/BaseButton';

const CreateEvent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  // const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const validateAccess = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session !== null) {
      setIsLoggedIn(true);
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
  let combinedDateTime = null;
  if (date && eventTime) {
    let [year, month, day] = date.split('-');
    let [hour, minute] = eventTime.split(':');
    combinedDateTime = new Date(
      Date.UTC(year, month - 1, day, hour, minute),
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoggedIn) {
      // Check if required fields are filled
      const fields = {
        イベント名: eventName,
        日付: date,
      };
      if (!validateFields(fields)) return;

      try {
        const eventData = {
          eventName,
          eventTime: combinedDateTime,
          date,
          location,
          // imageUrl,
          description,
        };
        const insertedData = await createEvent(eventData, selectedTags);
        // TODO: Reset form or redirect user
      } catch (error) {
        console.error('Error creating event', error);
      }
    } else {
      console.error('No user logged in');
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-10">
        <h1 className="text-2xl font-bold mb-8 text-text-yellow">
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
            {/* <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Image URL
          </label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          /> */}
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
