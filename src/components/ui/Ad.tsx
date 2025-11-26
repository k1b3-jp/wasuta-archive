"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

interface AdProps {
  adMaxId: string;
  className?: string;
}

type AdmaxAdType = {
  admax_id: string;
  type: 'switch' | 'banner';
};

declare global {
  // eslint-disable-next-line no-var
  var admaxads: AdmaxAdType[];
  // eslint-disable-next-line no-var
  var __admax_render__: unknown;
  // eslint-disable-next-line no-var
  var __admax_tag__: unknown;
}

const Ad = ({ adMaxId, className }: AdProps) => {
  const router = useRouter();
  const pathname = router.asPath;

  useEffect(() => {
    // 既にスクリプトタグが存在するかチェック
    const existingScript = document.querySelector('script[src="https://adm.shinobi.jp/st/t.js"]');

    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://adm.shinobi.jp/st/t.js';
      tag.async = true;
      tag.classList.add('admax-script');
      document.body.appendChild(tag);
    }

    globalThis.admaxads ??= [];
    if (globalThis.admaxads.find((x) => x.admax_id === adMaxId)) {
      return;
    }
    globalThis.admaxads.push({
      admax_id: adMaxId,
      type: 'banner',
    });

    return () => {
      // 個別のadMaxIdのみを削除
      globalThis.admaxads = globalThis.admaxads?.filter((x) => x.admax_id !== adMaxId) || [];

      // 全ての広告が削除された場合のみグローバル変数とスクリプトタグをリセット
      if (globalThis.admaxads.length === 0) {
        window.__admax_render__ = window.__admax_tag__ = undefined;
        // 全ての広告が削除された場合のみスクリプトタグを削除
        const scriptTag = document.querySelector('script[src="https://adm.shinobi.jp/st/t.js"]');
        if (scriptTag) {
          scriptTag.remove();
        }
      }
    };
  }, [adMaxId, pathname]);

  return (
    <div className={`flex justify-center ${className || ''}`}>
      <div
        key={pathname}
        className={`admax-ads inline-block ${adMaxId}`}
        data-admax-id={adMaxId}
      />
    </div>
  );
};

export default Ad; 
