import React from 'react';

interface BaseButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const BaseButton: React.FC<BaseButtonProps> = ({
  label,
  onClick,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {label}
    </button>
  );
};

export default BaseButton;
