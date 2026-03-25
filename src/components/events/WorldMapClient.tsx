"use client";

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

interface EventData {
  event_id: number;
  title?: string;
  event_name?: string;
  date: string;
  location?: string;
}

const createCustomIcon = (locId: string) => {
  let textColor = "text-amber-500";
  let bgColor = "bg-yellow-400";
  let borderColor = "border-yellow-300";
  let shadow = "shadow-[0_0_15px_rgba(250,204,21,0.6)]";
  
  if (["odaiba", "toyosu", "shinjuku", "shibuya", "harajuku", "shinagawa", "akasaka", "roppongi", "shinkiba", "ebisu", "akihabara", "yoyogi", "nakano", "daikanyama", "shirokane", "shimokitazawa", "ikebukuro", "tokyo_other", "makuhari", "saitama", "yokohama", "kawasaki", "kanagawa_other", "nagoya", "osaka_namba", "osaka_umeda", "osaka_other", "kobe", "kyoto", "shiga", "fukuoka", "saga", "kumamoto", "kagoshima", "okinawa", "sapporo", "sendai", "aomori", "hiroshima", "yamanashi", "shizuoka", "ishikawa", "ibaraki"].includes(locId)) {
    textColor = "text-pink-500";
    bgColor = "bg-pink-400";
    borderColor = "border-pink-300";
    shadow = "shadow-[0_0_15px_rgba(244,114,182,0.6)]"; // ポップなピンク系シャドウ
  }
  if (locId === "others") {
    // 予備用
    textColor = "text-purple-500";
    bgColor = "bg-purple-400";
    borderColor = "border-purple-300";
    shadow = "shadow-[0_0_15px_rgba(168,85,247,0.6)]";
  }

  return L.divIcon({
    className: 'custom-leaflet-icon group',
    html: `
      <div class="relative flex flex-col items-center justify-center w-12 h-12 cursor-pointer transition-transform duration-300 hover:scale-110 hover:-translate-y-2">
        <!-- 激しく光るオーラ -->
        <div class="absolute w-10 h-10 rounded-full animate-ping opacity-40 ${bgColor}"></div>
        <div class="absolute w-14 h-14 rounded-full animate-pulse opacity-30 ${bgColor} blur-md"></div>
        
        <!-- 猫顔ピン（白背景でポップに） -->
        <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 ${borderColor} ${shadow} z-10 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${textColor}">
            <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1.1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/>
            <path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/>
          </svg>
        </div>
        
        <!-- ピンの足 -->
        <div class="w-1.5 h-3 ${bgColor} -mt-1 z-0 opacity-90 rounded-b-full shadow-[0_4px_10px_currentColor]"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 46],
    popupAnchor: [0, -46],
  });
};

export default function WorldMapClient({ events, venues = [] }: { events: EventData[], venues?: any[] }) {
  const mappedLocations = useMemo(() => {
    const locMap = new Map();
    // データベースから取得した会場マスタ(venues)で初期化
    venues.forEach(loc => locMap.set(loc.id, { ...loc, count: 0, events: [] as EventData[] }));

    events.forEach(event => {
      let matched = false;
      if (event.location) {
        const locStr = event.location;
        
        // Virtual（オンライン・配信系）は実体がないためマップに表示しない
        if (/(オンライン|配信|YouTube|SHOWROOM|LINE LIVE|teket|Talkport|Zoom|電話|ニコニコ|ABEMA|TikTok|mu-mo|OPENREC|LINE ビデオ通話|ネット|オンラインサイン会)/i.test(locStr)) {
          return;
        }

        for (const mapLoc of venues) {
          if (mapLoc.keywords.some((kw: string) => locStr.includes(kw))) {
            const item = locMap.get(mapLoc.id);
            if (item) {
              item.count += 1;
              item.events.push(event);
            }
            matched = true;
            break;
          }
        }
        
        // デバッグ用: マッピング漏れの物理ロケーションを捕捉
        if (!matched && locStr && locStr !== "(未定)") {
          console.warn("- Unmapped Physical Location:", locStr);
        }
      }
    });

    return Array.from(locMap.values()).filter(loc => loc.count > 0);
  }, [events, venues]);

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[2/1] min-h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group bg-[#0e0e0e]">
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 20px; background: transparent; box-shadow: none; }
        .leaflet-popup-content { margin: 0 !important; width: 320px !important; }
        .leaflet-popup-tip-container { display: none; }
        /* カスタムスクロールバー */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}} />
      <MapContainer 
        center={[36, 138]} 
        zoom={5} 
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        style={{ width: '100%', height: '100%', zIndex: 10 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {mappedLocations.map((loc) => {
          return (
            <Marker 
              key={loc.id} 
              position={[loc.lat, loc.lng]} 
              icon={createCustomIcon(loc.id)}
            >
              <Popup closeButton={false}>
                <div className="bg-white rounded-[20px] overflow-hidden shadow-2xl w-full border border-gray-100">
                  <div className="bg-gradient-to-br from-pink-50 to-white p-5 text-center border-b border-pink-100 relative">
                    <h3 className="font-bold text-xl text-gray-900 font-handwriting">{loc.name}</h3>
                    <div className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full"><MapPin className="w-3 h-3" /> {loc.count} events</div>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-3 bg-gray-50/50 custom-scrollbar">
                    <div className="space-y-3">
                      {loc.events.map((ev: EventData) => {
                        const evDate = new Date(ev.date).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
                        return (
                          <Link href={`/events/${ev.event_id}`} target="_blank" key={ev.event_id} className="block group">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all">
                              <div className="font-bold text-gray-900 group-hover:text-primary transition-colors text-sm leading-snug mb-2 line-clamp-2">
                                {ev.title || ev.event_name}
                              </div>
                              <div className="flex justify-between items-end text-xs mt-2">
                                <span className="text-gray-500 line-clamp-1 flex-1 mr-3 text-[11px]"><MapPin className="inline w-3 h-3 mr-0.5 opacity-60 mb-0.5"/>{ev.location}</span>
                                <span className="font-bold text-primary bg-primary/5 border border-primary/10 px-2 py-1 rounded whitespace-nowrap text-[10px]">{evDate}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-black/60 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 shadow-2xl z-20 pointer-events-none">
        <div className="font-bold flex items-center gap-2 mb-1.5 text-sm md:text-base tracking-wider"><MapPin className="w-4 h-4 text-yellow-500" /> WORLD TOUR</div>
        <div className="text-white/70 text-xs md:text-sm">ピンをクリックして履歴を確認</div>
      </div>
    </div>
  );
}
