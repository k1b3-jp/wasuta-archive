import React from 'react';

interface TagProps {
  label: string;
}

const Tag: React.FC<TagProps> = ({ label }) => {
  return (
    <span className="bg-gray-100 text-gray-800 text-sm font-medium me-2 px-3 py-1 rounded-2xl ms-1">
      {label}
    </span>
  );
};

export default Tag;
