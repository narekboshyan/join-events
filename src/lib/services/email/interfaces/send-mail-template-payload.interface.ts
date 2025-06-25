export interface EventInvitationPayload {
  // Basic invitation info
  to: string;
  invitedUserName: string;
  inviterName: string;
  inviterEmail: string;
  invitationRole: string;
  personalMessage?: string;

  // Event details
  eventTitle: string;
  eventDescription?: string;
  eventType: string; // "online", "offline", "hybrid"
  eventCategory: string; // "party", "birthday", "wedding", etc.
  eventStartDate: string;
  eventEndDate: string;

  // Event settings
  isPaid: boolean;
  price?: string;
  currency?: string;
  maxParticipants?: number;
  currentParticipants: number;
  maxGuests: number;
  ageRestriction?: string;
  dressCode?: string;
  requiresApproval: boolean;

  // Locations array
  locations: Array<{
    name: string;
    venueType?: string;
    address?: string;
    startDatetime: string;
    endDatetime: string;
    capacity?: number;
    onlineUrl?: string;
    onlinePlatform?: string;
    meetingId?: string;
    accessCode?: string;
    specialInstructions?: string;
    parkingInfo?: string;
    publicTransport?: string;
  }>;

  // Action URLs
  acceptUrl: string;
  declineUrl: string;
  eventUrl: string;
}
