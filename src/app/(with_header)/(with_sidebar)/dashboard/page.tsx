"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { EventCard } from "@/components/event-card";
import {
  getParticipatingEvents,
  getSuggestedEvents,
  getAllEvents,
} from "./data";
import { Search } from "lucide-react";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const participatingEvents = getParticipatingEvents();
  const suggestedEvents = getSuggestedEvents();
  const allEvents = getAllEvents();

  const filteredAllEvents = allEvents.filter(
    (event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActionClick = (
    eventId: string,
    action: "view" | "join" | "leave"
  ) => {
    console.log(`Event ${eventId}: ${action} clicked`);
    // In a real app, you'd update state or make API calls here
    if (action === "join") {
      alert(`You joined ${eventId}! (This is a mock action)`);
    } else if (action === "leave") {
      alert(`You left ${eventId}! (This is a mock action)`);
    } else if (action === "view") {
      alert(`Viewing details for ${eventId}! (This is a mock action)`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8 text-center">Events</h1>

      {/* Your Events Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-border">
          Your Events
        </h2>
        {participatingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {participatingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onActionClick={handleActionClick}
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
        {suggestedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onActionClick={handleActionClick}
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
        {filteredAllEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAllEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onActionClick={handleActionClick}
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
