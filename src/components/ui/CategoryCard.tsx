import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface CategoryCardProps {
  href: string;
  src: string;
  alt: string;
  title: string;
  description: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ href, src, alt, title, description }) => {
  return (
    <Link href={href} className="p-4 rounded-xl shadow-md bg-white">
      <Image src={src} width="400" height="400" alt={alt} className="mb-2 rounded-xl w-1/2" />
      <h4 className="mb-1 font-bold">{title}</h4>
      <p className="text-xs text-deep-green">{description}</p>
    </Link>
  );
};

export default CategoryCard;
