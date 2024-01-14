import Link from 'next/link';
import React from 'react';

interface BaseButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  link?: string;
  yellow?: boolean;
}

const BaseButton: React.FC<BaseButtonProps> = ({
  label,
  onClick,
  disabled,
  link,
  yellow,
}) => {
  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-white py-2 px-4 rounded-md transition-colors transition duration-300 ease-in-out shadow-md
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${yellow ? 'bg-text-yellow' : ''}
    `}
    >
      {label}
    </button>
  );

  return link ? <Link href={link}>{button}</Link> : button;
};

export default BaseButton;
