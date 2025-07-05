"use client";
import React from "react";

interface AdProps {
  adMaxId: string;
  className?: string;
}

const Ad = ({ adMaxId, className }: AdProps) => {
  // 提供されたHTMLタグを直接埋め込む
  const adHtml = `<!-- admax --><script src="https://adm.shinobi.jp/s/${adMaxId}"></script><!-- admax -->`;

  return (
    <div className={`flex justify-center ${className || ''}`}>
      <div
        className="ad-container"
        dangerouslySetInnerHTML={{ __html: adHtml }}
      />
    </div>
  );
};

export default Ad; 
