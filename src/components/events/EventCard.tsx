import Image from 'next/image';
import React from 'react';
import { EventCardProps } from '../../types/event';
import BaseButton from '../ui/BaseButton';

const defaultImageUrl = '/event-placeholder.png';

const EventCard: React.FC<EventCardProps> = ({
  title,
  location,
  date,
  imageUrl,
  id,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return (
    <div className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden max-w-sm relative">
      <Image
        src={imageUrl || defaultImageUrl}
        alt={title}
        width={500}
        height={300}
        className="w-full"
      />
      <div className="absolute top-0 right-0 py-1 px-3 rounded-bl-lg bg-light-blue text-white">
        {formattedDate}
      </div>
      <div className="p-4">
        <div className="mb-4">
          <div className="text-lg font-semibold">{title}</div>
        </div>
        <div className="text-gray-500 mb-4 min-h-6">{location}</div>
        <BaseButton label="詳細を見る" link={`/events/${id}`} />
      </div>
    </div>
  );
};

export default EventCard;
