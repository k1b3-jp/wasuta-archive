import React from 'react';

interface TagProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const Tag: React.FC<TagProps> = ({ label, selected, onSelect }) => {
  const selectedStyles = 'bg-blue-600 text-white';
  const unselectedStyles = 'bg-blue-100 text-blue-600';

  const buttonStyles = selected ? selectedStyles : unselectedStyles;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-sm font-medium px-4 py-2 rounded-full transition duration-300 ease-in-out ${buttonStyles}`}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
};

export default Tag;
