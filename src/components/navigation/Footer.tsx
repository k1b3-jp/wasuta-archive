import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-7 flex flex-wrap flex-col gap-2 text-white bg-light-black text-sm">
      <Link href="/form" className="mx-auto underline">
        お問い合わせ
      </Link>
      <p className="mx-auto">©k1b3-jp. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
