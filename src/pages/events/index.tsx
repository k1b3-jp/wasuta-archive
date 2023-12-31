import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/app/layout';
import EventCard from '@/components/events/EventCard';
import { getEvents } from '@/lib/supabase/getEvents'; // assuming getEvents is in a separate file

interface EventListProps {
  events: any[];
}

export async function getStaticProps() {
  const events = await getEvents({
    limit: 12,
  });
  return {
    props: {
      events,
    },
  };
}

const EventListPage: React.FC<EventListProps> = ({ events }) => {
  return (
    <DefaultLayout>
      <div className="bg-gray-100 py-8">
        <div className="max-w-md mx-auto">
          <header className="mb-4">
            {/* Search bar and other header elements with TailwindCSS classes */}
          </header>
          <main className="grid grid-cols-1 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} title={event.title} />
            ))}
          </main>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EventListPage;
