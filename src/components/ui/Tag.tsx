import React from 'react';

interface TagProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const Tag: React.FC<TagProps> = ({ label, selected, onSelect }) => {
  const selectedStyles = 'bg-text-deep-green text-white';
  const unselectedStyles =
    'bg-white text-text-deep-green border border-text-green';

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
