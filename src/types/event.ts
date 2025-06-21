import { EventResolver } from "@/lib/resolvers/event.resolver";

export type AllEventType = Awaited<
  ReturnType<typeof EventResolver.getAllEvents>
>;
export type EventType = Awaited<ReturnType<typeof EventResolver.getEventById>>;
export type AllUserEventsType = Awaited<
  ReturnType<typeof EventResolver.getUserEvents>
>;
