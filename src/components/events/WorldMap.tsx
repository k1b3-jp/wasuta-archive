import dynamic from 'next/dynamic';
import React from 'react';

interface EventData {
  event_id: number;
  title?: string;
  event_name?: string;
  date: string;
  location?: string;
}

// Leafletはサーバーサイドレンダリング（SSR）に対応していないため、常にクライアントで動的読み込みさせます
const WorldMapClient = dynamic(() => import('./WorldMapClient'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full aspect-[4/3] md:aspect-[2/1] min-h-[400px] bg-[#1a1a2e]/90 backdrop-blur rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
      <div className="text-white/70 font-bold animate-pulse tracking-widest text-sm">LOADING MAP...</div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
    </div>
  )
});

export default function WorldMap({ events, venues = [] }: { events: EventData[], venues?: any[] }) {
  return <WorldMapClient events={events} venues={venues} />;
}
