"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Search } from "lucide-react";
import { EventService } from "@/api/services/event.service";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EventCreationForm } from "./_components/EventCreationForm";

export default function EventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data } = useQuery({
    queryFn: EventService.getCurrentUserEvents,
    queryKey: ["all-user-events"],
    initialData: [],
  });

  return (
    <div className="container mx-auto py-8 px-4 bg-background text-foreground">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Events</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-5 w-5 mr-2" /> Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl overflow-y-auto max-h-[90vh] p-0 border-none">
            <EventCreationForm onClose={() => setIsModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar for Created Events */}
      <div className="mb-6 relative">
        <Input
          type="text"
          placeholder="Search your created events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      {/* List of Created Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-border">
          All Your Created Events
        </h2>
        {data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onActionClick={() => {}}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            You haven&apos;t created any events yet.
          </p>
        )}
      </section>
    </div>
  );
}
