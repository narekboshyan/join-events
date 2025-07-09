export interface EventInvitationPayload {
  to: string;
  invitedUserName: string;
  inviterName: string;
  inviterEmail: string;
  invitationRole: string;
  personalMessage?: string;

  // Event details
  eventTitle: string;
  eventDescription?: string;
  eventType: string;
  eventCategory: string;
  eventStartDate: string;
  eventEndDate: string;

  // Event settings
  isPaid: boolean;
  price?: string;
  currency: string;
  maxParticipants?: number;
  currentParticipants: number;
  maxGuests: number;
  ageRestriction?: string;
  dressCode?: string;
  requiresApproval: boolean;

  // Locations
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

  // QR Code and Auth URLs - ADD THESE FIELDS
  qrCodeUrl?: string; // Base64 data URL for embedding in email
  qrCodeData: string; // The actual QR code data as string
  authUrl: string;
  eventUrl: string;
  hasAccount: boolean;
  invitationToken: string;
}
