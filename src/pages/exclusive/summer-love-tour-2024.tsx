import DefaultLayout from "@/app/layout";
import { NextSeo } from "next-seo";
import React, { useEffect, useState } from "react";
import { getEvents } from "@/lib/supabase/getEvents";
import EventCard from "@/components/events/EventCard";
import { faPaw, faToriiGate, faFish, faBreadSlice, faDiamond, faCow, faSnowflake, faMountain, faTowerCell, faFlag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faOctopusDeploy } from "@fortawesome/free-brands-svg-icons";
import Image from "next/image";
import { Player } from "@lottiefiles/react-lottie-player";

const SummerLoveTour2024 = () => {
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

  const getIcon = (eventId: number) => {
    switch (eventId) {
      case 913:
        return { icon: faToriiGate, color: "text-white bg-purple" };
      case 914:
        return { icon: faFish, color: "text-white bg-light-green" };
      case 915:
        return { icon: faOctopusDeploy, color: "text-slate-500 bg-slate-300" };
      case 916:
        return { icon: faBreadSlice, color: "text-white bg-pink" };
      case 917:
        return { icon: faDiamond, color: "text-slate-500 bg-slate-300" };
      case 918:
        return { icon: faCow, color: "text-slate-500 bg-slate-300" };
      case 919:
        return { icon: faSnowflake, color: "text-white bg-light-blue" };
      case 920:
        return { icon: faMountain, color: "text-slate-500 bg-slate-300" };
      case 921:
        return { icon: faTowerCell, color: "text-slate-500 bg-slate-300" };
      default:
        return { icon: faFlag, color: "text-slate-500 bg-slate-300" }; // デフォルトのアイコンと色
    }
  };

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
        <main className="bg-100vw pb-10 pl-4 bg-gradient-to-r from-blue-200 to-cyan-200">
          <div className="title px-2 py-6">
            <div className="text-white">
              - 特集 -
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">
                わーすた
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-teal-500">
                  夏恋
                </span>
                ツアー<br />
                2024
              </span>
            </h1>
          </div>
          <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white before:to-transparent">
            {events.map((event, index) => {
              const eventDate = new Date(event.date).toISOString().split('T')[0];
              const { icon, color } = getIcon(event.event_id);
              const isLatestPastEvent = latestPastEventId === event.event_id;

              return (
                <div
                  key={event.id}
                  className="relative flex items-center justify-between md:justify-normal md:flex-row-reverse group"
                >
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:-translate-x-1/2 ${color}`}>
                    <FontAwesomeIcon icon={icon} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4">
                    <EventCard
                      key={event.event_id}
                      title={event.event_name}
                      location={event.location}
                      date={event.date}
                      imageUrl={event.image_url}
                      id={event.event_id}
                    />
                    {isLatestPastEvent && (
                      <div className="flex items-center justify-center mb-[-40px]">
                        <Player
                          autoplay
                          loop
                          src="https://lottie.host/e2e81468-31ae-46fc-b61b-a65848d2d51d/Spqx5p7Jor.json"
                          style={{ height: "100%", width: "100%" }}
                        />
                      </div>
                    )}
                  </div>
                  {eventDate < today && <div className="flex items-center justify-center absolute top-2 right-[250px] lg:right-[400px] text-[red] rounded-full border border-[red] w-20 h-20"><FontAwesomeIcon icon={faPaw} size="3x" /></div>}
                </div>
              );
            })}
          </div>
        </main>
      </DefaultLayout>
    </>
  );
};

export default SummerLoveTour2024;
