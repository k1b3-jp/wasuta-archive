import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react';

interface CategoryCardProps {
  href: string;
  src: any;
  title: string;
  description: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ href, src, title, description }) => {
  return (
    <Link href={href} className="p-4 rounded-xl shadow-md bg-white">
      <FontAwesomeIcon icon={src} className="mb-3 text-4xl text-deep-green" />
      <h4 className="mb-1 font-bold">{title}</h4>
      <p className="text-xs">{description}</p>
    </Link>
  );
};

export default CategoryCard;
