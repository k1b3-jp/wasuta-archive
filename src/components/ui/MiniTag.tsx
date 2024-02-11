import React from 'react';

interface TagProps {
  label: string;
}

const Tag: React.FC<TagProps> = ({ label }) => {
  let tagStyles;
  switch (label) {
    case '奈々聖':
      tagStyles = 'bg-light-green text-white';
      break;
    case '瑠香':
      tagStyles = 'bg-pink text-white';
      break;
    case '美里':
      tagStyles = 'bg-purple text-white';
      break;
    case '梨々華':
      tagStyles = 'bg-light-blue text-white';
      break;
    case '葉月':
      tagStyles = 'bg-yellow text-white';
      break;
    default:
      tagStyles = 'bg-gray-100 text-gray-800';
      break;
  }

  return (
    <span className={`text-sm font-medium me-2 px-3 py-1 rounded-2xl ms-1 ${tagStyles}`}>
      {label}
    </span>
  );
};

export default Tag;
