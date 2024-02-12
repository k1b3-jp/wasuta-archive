import Link from 'next/link';
import React from 'react';

interface BaseButtonProps {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  link?: string;
  danger?: boolean;
}

const BaseButton: React.FC<BaseButtonProps> = ({ label, onClick, disabled, link, danger }) => {
  let buttonStyles = 'text-white bg-deep-green';
  if (danger) {
    buttonStyles = 'text-red-500 bg-white border border-red-500';
  }

  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-2 px-4 rounded-3xl transition-colors transition duration-300 ease-in-out shadow-md 
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${buttonStyles}
    `}
    >
      {label}
    </button>
  );

  return link ? <Link href={link}>{button}</Link> : button;
};

export default BaseButton;
