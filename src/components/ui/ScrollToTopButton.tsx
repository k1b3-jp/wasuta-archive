import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // トグル可視性関数
  const toggleVisibility = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsVisible(window.scrollY > 300);
    }
  }, []); // useCallbackで関数を最適化

  // スクロールイベントリスナー
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    // 初期状態をチェック
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [toggleVisibility]); // 依存配列に追加

  // トップにスクロール
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "bg-white/80 hover:bg-white",
        "rounded-full p-3",
        "shadow-lg backdrop-blur-sm",
        "transition-all duration-300",
        "flex items-center justify-center",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
      aria-label="トップに戻る"
    >
      <ArrowUp className="w-5 h-5 text-gray-700" />
    </button>
  );
}; 
