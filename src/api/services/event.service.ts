import { EventCreationInput, InviteFormData } from "@/lib/validations/event";
import { AllEventType, AllUserEventsType, EventType } from "@/types/event";
import $apiClient from "./axios";

export class EventService {
  static getAllEvents() {
    return $apiClient.get<AllEventType>("/events");
  }
  static getCurrentUserEvents() {
    return $apiClient.get<AllUserEventsType>("/users/me/events");
  }

  static getEventById(id: string) {
    return $apiClient.get<EventType>(`/events/${id}`);
  }

  static createEvent(eventData: EventCreationInput) {
    return $apiClient.post("/events", eventData);
  }

  static updateEvent(id: string, eventData: Partial<EventCreationInput>) {
    return $apiClient.put(`/events/${id}`, eventData);
  }

  static sendBulkEventInvitations(eventId: string, input: InviteFormData) {
    return $apiClient.post(`/events/${eventId}/invitations`, input);
  }
}
