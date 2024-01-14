import Link from 'next/link';
import React from 'react';

interface BaseButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  link?: string;
}

const BaseButton: React.FC<BaseButtonProps> = ({
  label,
  onClick,
  disabled,
  link,
}) => {
  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-white py-2 px-3 rounded-md transition-colors transition duration-300 ease-in-out shadow-md
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
    >
      {label}
    </button>
  );

  return link ? <Link href={link}>{button}</Link> : button;
};

export default BaseButton;
