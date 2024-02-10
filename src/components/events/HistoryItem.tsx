import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { getEventTags } from '@/lib/supabase/getEventTags';
import { TagType } from '@/types/tag';
import { EventCardProps } from '../../types/event';
import BaseButton from '../ui/BaseButton';

const defaultImageUrl = '/event-placeholder.png';

const HistoryItem: React.FC<EventCardProps> = ({
  title,
  location,
  date,
  imageUrl,
  id,
  description,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  //idに紐づくタグを取得する
  const [eventTags, setEventTags] = useState<TagType[] | undefined>([]);

  useEffect(() => {
    fetchEventTags();
  }, [id]);

  const fetchEventTags = async () => {
    const tags = await getEventTags(id);
    setEventTags(tags);
  };

  return (
    <li className="mb-10 ms-6">
      <span className="absolute flex items-center justify-center w-6 h-6 bg-light-blue rounded-full -start-3 ring-8 ring-white">
        <svg
          className="w-2.5 h-2.5 text-deep-blue"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
        </svg>
      </span>
      <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
        {title}
        {eventTags?.map(
          (tag: { id: React.Key | null | undefined; label: string | null | undefined }) => (
            <span
              key={tag.id}
              className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded ms-1"
            >
              {tag.label}
            </span>
          ),
        )}
      </h3>
      <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
        {formattedDate}
      </time>
      <div className="mb-4">
        <Image
          src={imageUrl || defaultImageUrl}
          alt={title}
          width={500}
          height={300}
          className="w-full"
        />
      </div>
      <p className="mb-2 text-base font-normal text-gray-500">{description}</p>
      <div className="inline-flex items-center py-2">
        <BaseButton label="詳細を見る" link={`/events/${id}`} />
      </div>
    </li>
  );
};

export default HistoryItem;
