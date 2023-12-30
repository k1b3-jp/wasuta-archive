import React from 'react';

interface EventCardProps {
  title: string;
  location: string;
  date: string;
  imageUrl: string;
}

const EventCard: React.FC<EventCardProps> = ({ title, location, date, imageUrl }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm relative">
      <img src={imageUrl} alt={title} className="w-full" />
      <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 py-1 px-3 rounded-bl-lg">
        {date}
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
