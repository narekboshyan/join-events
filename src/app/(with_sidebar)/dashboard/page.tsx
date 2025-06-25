"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { EventService } from "@/api/services/event.service";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allEvents } = useQuery({
    queryFn: EventService.getAllEvents,
    queryKey: ["allEvents"],
    initialData: [],
  });

  return (
    <div className="container mx-auto py-8 px-4 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8 text-center">Events</h1>

      {/* Your Events Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-border">
          Your Events
        </h2>
        {allEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onActionClick={() => {}}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            You are not participating in any events yet.
          </p>
        )}
      </section>

      {/* Suggested Events Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-border">
          Suggested Events
        </h2>
        {allEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onActionClick={() => {}}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No suggestions at the moment.
          </p>
        )}
      </section>

      {/* All Events Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-border">
          All Events
        </h2>
        <div className="mb-6 relative">
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        {allEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onActionClick={() => {}}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No events found matching your search.
          </p>
        )}
      </section>
    </div>
  );
}
