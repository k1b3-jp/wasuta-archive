import React from 'react';
import { Event } from '../../types/event';
import Image from 'next/image';

const defaultImageUrl = '/event-placeholder.png';

const EventCard: React.FC<Event> = ({ title, location, date, imageUrl }) => {
  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm relative">
      <Image
        src={imageUrl || defaultImageUrl}
        alt={title}
        width={500}
        height={300}
        className="w-full"
      />
      <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 py-1 px-3 rounded-bl-lg">
        {formattedDate}
      </div>
      <div className="p-4">
        <div className="mb-4">
          <div className="text-lg font-semibold">{title}</div>
        </div>
        <div className="text-gray-500 mb-4">{location}</div>
        <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors">
          詳細を見る
        </button>
      </div>
    </div>
  );
};

export default EventCard;
