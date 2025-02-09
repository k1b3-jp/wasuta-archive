import DefaultLayout from "@/app/layout";
import { NextSeo } from "next-seo";
import React, { useEffect, useState } from "react";
import { getEvents } from "@/lib/supabase/getEvents";
import { Dialog } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { DialogContent } from "@/components/ui/dialog";

const Anniversary10th = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [latestPastEventId, setLatestPastEventId] = useState<number | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const fetchEvents = async () => {
    try {
      const eventsData = await getEvents({
        keyword: "わーすた夏恋ツアー",
        sortBy: "date",
        ascending: true,
      });
      setEvents(eventsData);

      const pastEvents = eventsData.filter(event => new Date(event.date) < new Date(today));
      if (pastEvents.length > 0) {
        const latestPastEvent = pastEvents.reduce((latest, event) => {
          return new Date(event.date) > new Date(latest.date) ? event : latest;
        }, pastEvents[0]);
        setLatestPastEventId(latestPastEvent.event_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetchEvents();
  }, []);

  interface Image {
    id: string;
    url: string;
    alt: string;
    width: number;
    height: number;
  }

  const images: Image[] = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
      alt: "Concert photo 1",
      width: 800,
      height: 600,
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
      alt: "Concert photo 2",
      width: 800,
      height: 600,
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
      alt: "Concert photo 3",
      width: 600,
      height: 800,
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec",
      alt: "Concert photo 4",
      width: 800,
      height: 600,
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea",
      alt: "Concert photo 5",
      width: 800,
      height: 600,
    },
  ];

  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const isMobile = useIsMobile();

  // Create a duplicated array of images for seamless looping
  const duplicatedImages = [...images, ...images];

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const newPosition = prev + 1;
        // Reset position when reaching the height of original images set
        const totalHeight = 100 * images.length;
        return newPosition >= totalHeight ? 0 : newPosition;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);


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
      <DefaultLayout>
        <main className="bg-100vw pb-10 pl-4">
          <div className="min-h-screen bg-gallery-bg px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 text-center sm:mb-12">
                <span className="mb-2 inline-block rounded-full bg-black/5 px-3 py-1 text-sm font-medium tracking-wide text-black/70 sm:px-4 sm:py-1.5">
                  Photo Collection
                </span>
                <h1 className="mt-3 text-3xl font-medium tracking-tight text-gray-900 sm:mt-4 sm:text-5xl">
                  Premium Gallery
                </h1>
                <p className="mt-3 text-sm text-gray-500 sm:mt-4 sm:text-lg">
                  A curated collection of stunning photographs
                </p>
              </div>

              <div
                className={cn(
                  "grid gap-4 sm:gap-6 relative overflow-hidden",
                  isMobile
                    ? "grid-cols-1"
                    : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                  "auto-rows-[200px] sm:auto-rows-[250px]"
                )}
                style={{
                  transform: `translateY(${-scrollPosition}px)`,
                  transition: "transform 0.5s ease-out",
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
                        "group relative cursor-pointer overflow-hidden rounded-2xl bg-gallery-card backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
                        image.height > image.width ? "row-span-2" : ""
                      )}
                      onClick={() => setSelectedImage(image)}
                      style={{
                        transform: `scale(${scale}) translateY(${translateY}px)`,
                        transition: "transform 0.5s ease-out",
                      }}
                    >
                      <div className="relative h-full w-full">
                        <img
                          src={`${image.url}?auto=format&fit=crop&w=800&q=80`}
                          alt={image.alt}
                          loading="lazy"
                          onError={(e) => {
                            console.error(`画像の読み込みに失敗しました: ${image.url}`);
                            e.currentTarget.style.display = 'none';
                          }}
                          className={cn(
                            "absolute inset-0 h-full w-full object-cover",
                            "transition-transform duration-300",
                            "group-hover:scale-105"
                          )}
                        />
                        <div className="absolute inset-0 bg-gallery-overlay opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Dialog
                open={!!selectedImage}
                onOpenChange={() => setSelectedImage(null)}
              >
                <DialogContent className="max-w-4xl animate-modal-in bg-white/90 p-0 backdrop-blur-xl">
                  {selectedImage && (
                    <div className="relative aspect-auto max-h-[80vh]">
                      <img
                        src={`${selectedImage.url}?auto=format&fit=crop&w=1600&q=90`}
                        alt={selectedImage.alt}
                        className="h-full w-full object-contain"
                      />
                    </div>
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
