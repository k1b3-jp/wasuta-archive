import DefaultLayout from "@/app/layout";
import { NextSeo } from "next-seo";
import React, { useEffect, useState } from "react";
import { getEvents } from "@/lib/supabase/getEvents";
import { Dialog } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface Image {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

interface EventImage extends Image {
  title: string;
  date: string;
  venue: string;
  description?: string;
  rawDate: string;
}

const Anniversary10th = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [images, setImages] = useState<EventImage[]>([]);
  const [sortByDate, setSortByDate] = useState(false);
  const [latestPastEventId, setLatestPastEventId] = useState<number | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundImages, setBackgroundImages] = useState<EventImage[]>([]);
  const [bgScrollPosition, setBgScrollPosition] = useState(0);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await getEvents({
        sortBy: "date",
        ascending: true,
      });
      setEvents(eventsData);

      // イベントデータから画像データを生成
      const imageData: EventImage[] = eventsData
        .filter(event => event.image_url)
        .map((event) => ({
          id: event.event_id.toString(),
          url: event.image_url,
          alt: event.title || event.event_name || `Event photo`,
          width: 800,
          height: event.is_portrait ? 800 : 600,
          title: event.title || event.event_name,
          date: new Date(event.date).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          rawDate: event.date,
          venue: event.location || "未設定",
          description: event.description,
        }));

      // メインとバックグラウンドで別々のシャッフル配列を作成
      setImages(shuffleArray([...imageData]));
      setBackgroundImages(shuffleArray([...imageData]));

      // データ読み込み完了後、少し待ってからフェードアウト
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (err) {
      console.error(err);
    } finally {
      // フェードアウトクラスを追加してからローディングを終了
      const loadingElement = document.querySelector('.loading-screen');
      loadingElement?.classList.add('animate-fade-out');

      // フェードアウトアニメーション完了後にローディング状態を更新
      setTimeout(() => {
        setIsLoading(false);
      }, 800); // フェードアウトアニメーションの時間
    }
  };

  // ソート順変更時の処理
  useEffect(() => {
    if (!images.length) return;

    let sortedImages: EventImage[];
    if (sortByDate) {
      sortedImages = [...images].sort((a, b) =>
        new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
      );
    } else {
      // 新しいシャッフルされた配列を作成
      sortedImages = shuffleArray([...images]);
    }

    setImages(sortedImages);
    setScrollPosition(0);
  }, [sortByDate]);

  // 配列をシャッフルする関数を修正
  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetchEvents();
  }, []);

  const [selectedImage, setSelectedImage] = useState<EventImage | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const isMobile = useIsMobile();

  // Create a duplicated array of images for seamless looping
  const duplicatedImages = [...images, ...images];

  // スクロールアニメーションの処理
  useEffect(() => {
    // Dialogが開いているときはアニメーションを停止
    if (selectedImage) {
      return;
    }

    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const newPosition = prev + 1;
        const totalHeight = images.length > 0 ? 100 * images.length : 0;
        return newPosition >= totalHeight ? 0 : newPosition;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [images, selectedImage]);

  // 背景用のスクロールアニメーション
  useEffect(() => {
    if (selectedImage) return;

    const interval = setInterval(() => {
      setBgScrollPosition((prev) => {
        const newPosition = prev + 0.5; // メインコンテンツより遅い速度
        const totalHeight = backgroundImages.length > 0 ? 100 * backgroundImages.length : 0;
        return newPosition >= totalHeight ? 0 : newPosition;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [backgroundImages, selectedImage]);

  // imagesの定義を削除（useState で管理するため）

  // ローディング画面の表示
  if (isLoading) {
    return (
      <DefaultLayout hideHeader hideBottomNav>
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center loading-screen">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <div className="h-[1px] w-12 bg-gray-400"></div>
              <span className="text-lg font-medium text-gray-600">2015 - 2025</span>
              <div className="h-[1px] w-12 bg-gray-400"></div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              わーすた10年間の歩み
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base mb-8">
              10年間の思い出と感動を、写真とともに振り返ります
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // メインコンテンツから重複するタイトル部分を削除
  return (
    <>
      <NextSeo
        title="わーすた夏恋ツアー"
        openGraph={{
          images: [
            {
              url: process.env.defaultOgpImage || "",
              width: 1200,
              height: 630,
              alt: "Og Image Alt",
            },
          ],
        }}
      />
      <DefaultLayout hideHeader hideBottomNav>
        {/* 背景レイヤー */}
        <div className="fixed inset-0 overflow-hidden bg-black">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              transform: `translateY(${-bgScrollPosition}px)`,
              transition: "transform 0.5s ease-out",
            }}
          >
            <div className="grid grid-cols-4 gap-2 p-2">
              {[...backgroundImages, ...backgroundImages].map((image, index) => (
                <div
                  key={`bg-${image.id}-${index}`}
                  className="aspect-square overflow-hidden"
                >
                  <img
                    src={`${image.url}?auto=format&fit=crop&w=400&q=60`}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* オーバーレイ */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>

        {/* メインコンテンツ */}
        <main className="relative z-10 bg-transparent pb-10 pl-4 bg-100vw">
          <div className="min-h-screen bg-gallery-bg px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
            <div className="mx-auto px-4 sm:px-8 lg:px-12">
              <div className="text-center mb-16 opacity-0 animate-fade-in">
                <div className="inline-flex items-center justify-center gap-3 mb-6">
                  <div className="h-[1px] w-12 bg-gray-400"></div>
                  <span className="text-lg font-medium text-gray-600">2015 - 2025</span>
                  <div className="h-[1px] w-12 bg-gray-400"></div>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                  わーすたの歩み
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                  10年間の思い出と感動を、写真とともに振り返ります
                </p>
              </div>

              {/* ソートボタンを固定表示 */}
              <div className="fixed top-6 right-6 z-20">
                <button
                  onClick={() => setSortByDate(!sortByDate)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors shadow-lg", // shadow-smからshadow-lgに変更
                    sortByDate
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50",
                    "backdrop-blur-sm" // 背景のブラー効果を追加
                  )}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {sortByDate ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    )}
                  </svg>
                  {sortByDate ? "日付順" : "ランダム"}
                </button>
              </div>

              <div
                className={cn(
                  "grid gap-2 relative overflow-hidden -mt-14 pt-14",
                  isMobile
                    ? "grid-cols-1"
                    : [
                      "grid-cols-2",
                      "lg:grid-cols-3",
                      "xl:grid-cols-3",
                      "2xl:grid-cols-4",
                      "3xl:grid-cols-5"
                    ].join(" "),
                  "auto-cols-[minmax(400px,_1fr)]"
                )}
                style={{
                  transform: images.length > 0 && !selectedImage ? `translateY(${-scrollPosition}px)` : 'none',
                  transition: "transform 0.5s ease-out",
                  height: images.length > 0 ? `${100 * images.length * 2}px` : 'auto',
                  maxWidth: "100%",
                  margin: "0 auto",
                  padding: "0 1px",
                }}
              >
                {duplicatedImages.map((image, index) => {
                  const offset = (scrollPosition + index * 45) * (Math.PI / 180);
                  const scale = 1 + Math.sin(offset) * 0.05;
                  const translateY = Math.sin(offset) * 10;

                  return (
                    <div
                      key={`${image.id}-${index}`}
                      className={cn(
                        "group relative cursor-pointer overflow-hidden bg-gallery-card transition-transform duration-300",
                        "w-full",
                      )}
                      onClick={() => setSelectedImage(image)}
                      style={{
                        transform: `scale(${scale}) translateY(${translateY}px)`,
                        transition: "transform 0.5s ease-out",
                      }}
                    >
                      <div className="relative h-full w-full">
                        <img
                          src={`${image.url}?auto=format&fit=crop&w=1600&h=800&q=80`}
                          alt={image.alt}
                          loading="lazy"
                          onError={(e) => {
                            console.error(`画像の読み込みに失敗しました: ${image.url}`);
                            e.currentTarget.style.display = 'none';
                          }}
                          className={cn(
                            "h-full w-full object-cover",
                            "transition-transform duration-300",
                            "group-hover:scale-110"
                          )}
                        />
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent",
                            "opacity-0 group-hover:opacity-100",
                            "transition-opacity duration-300",
                            "flex items-end p-6"
                          )}
                        >
                          <div className="text-white text-base sm:text-lg lg:text-xl font-medium truncate w-full">
                            {image.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Dialog
                open={!!selectedImage}
                onOpenChange={() => setSelectedImage(null)}
              >
                <DialogContent
                  className={cn(
                    "animate-modal-in bg-white p-0",
                    "w-[80%] lg:w-[40%]",
                    "max-w-[1200px]",
                    "mx-auto"
                  )}
                >
                  {selectedImage && (
                    <>
                      <div className="event-head bg-light-gray p-4">
                        <img
                          src={selectedImage.url}
                          alt={selectedImage.alt}
                          className="mx-auto object-contain max-h-[40vh]"
                        />
                      </div>
                      <div className="event-detail p-6">
                        <h1 className="text-font-color font-bold text-xl mb-4">
                          {selectedImage.alt}
                        </h1>
                        <div className="flex flex-row gap-2 items-center mb-4">
                          <div className="bg-light-gray py-2 px-3 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p>{selectedImage.date}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center mb-6">
                          <div className="bg-light-gray py-2 px-3 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <p>{selectedImage.venue}</p>
                        </div>
                        {selectedImage.description && (
                          <div className="flex flex-col gap-2 mb-6">
                            <h2 className="text-l font-bold">イベントについて</h2>
                            <p className="whitespace-pre-wrap">{selectedImage.description}</p>
                          </div>
                        )}

                        {/* 遷移ボタンを追加 */}
                        <div className="mt-6 text-center">
                          <Link
                            href={`/events/${selectedImage.id}`}
                            rel="noopener noreferrer"
                            target="_blank"
                            className={cn(
                              "inline-flex items-center justify-center",
                              "px-6 py-2 rounded",
                              "bg-black text-white",
                              "hover:bg-gray-800 transition-colors",
                              "text-sm font-medium"
                            )}
                          >
                            イベント詳細を見る
                            <svg
                              className="w-4 h-4 ml-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </main>
      </DefaultLayout>
    </>
  );
};

export default Anniversary10th;
