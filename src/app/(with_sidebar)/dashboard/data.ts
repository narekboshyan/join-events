import { z } from "zod";

// --- Event Types ---
export enum EventType {
  Wedding = "wedding",
  Birthday = "birthday",
  Custom = "custom",
}

// --- Template Data ---
export interface Template {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export const weddingTemplates: Template[] = [
  {
    id: "w-classic",
    name: "Classic Elegance",
    description: "Timeless and sophisticated wedding theme.",
    imageUrl: "/placeholder.svg?height=150&width=250",
  },
  {
    id: "w-rustic",
    name: "Rustic Charm",
    description: "Cozy, natural, and intimate outdoor wedding.",
    imageUrl: "/placeholder.svg?height=150&width=250",
  },
  {
    id: "w-modern",
    name: "Modern Minimalist",
    description: "Sleek lines and contemporary design.",
    imageUrl: "/placeholder.svg?height=150&width=250",
  },
];

export const birthdayTemplates: Template[] = [
  {
    id: "b-fun",
    name: "Fun & Festive",
    description: "Vibrant and playful party for all ages.",
    imageUrl: "/placeholder.svg?height=150&width=250",
  },
  {
    id: "b-milestone",
    name: "Milestone Celebration",
    description: "Elegant and memorable for special birthdays.",
    imageUrl: "/placeholder.svg?height=150&width=250",
  },
  {
    id: "b-kids",
    name: "Kids' Adventure",
    description: "Themed party for children with games and activities.",
    imageUrl: "/placeholder.svg?height=150&width=250",
  },
];

export const customTemplates: Template[] = [
  {
    id: "c-basic",
    name: "Basic Layout",
    description: "A simple, flexible template for any custom event.",
    imageUrl: "/placeholder.svg?height=150&width=250",
  },
  {
    id: "c-professional",
    name: "Professional Event",
    description: "Clean and structured for conferences or workshops.",
    imageUrl: "/placeholder.svg?height=150&width=250",
  },
];

export const getTemplatesByType = (type: EventType): Template[] => {
  switch (type) {
    case EventType.Wedding:
      return weddingTemplates;
    case EventType.Birthday:
      return birthdayTemplates;
    case EventType.Custom:
      return customTemplates;
    default:
      return [];
  }
};

// --- Zod Schema for Event Creation Form ---
const baseSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  eventDate: z.string().min(1, "Event date is required"), // Using string for simplicity, could be Date object with a date picker
  eventTime: z.string().min(1, "Event time is required"),
  description: z.string().optional(),
  eventType: z.nativeEnum(EventType, {
    required_error: "Event type is required",
  }),
  locationType: z.enum(["single", "multiple"], {
    required_error: "Location type is required",
  }),
});

export const eventCreationSchema = baseSchema
  .and(
    z.union([
      z.object({
        eventType: z.literal(EventType.Wedding),
        selectedTemplateId: z.string().min(1, "Wedding template is required"),
      }),
      z.object({
        eventType: z.literal(EventType.Birthday),
        selectedTemplateId: z.string().min(1, "Birthday template is required"),
      }),
      z.object({
        eventType: z.literal(EventType.Custom),
        selectedTemplateId: z.string().optional(), // Custom events might not require a template
      }),
    ])
  )
  .and(
    z.union([
      z.object({
        locationType: z.literal("single"),
        singleLocation: z.string().min(1, "Location is required"),
      }),
      z.object({
        locationType: z.literal("multiple"),
        multipleLocations: z
          .array(z.string().min(1, "Location cannot be empty"))
          .min(1, "At least one location is required"),
      }),
    ])
  )
  .superRefine((data, ctx) => {
    // Custom validation for template based on eventType
    if (data.eventType !== EventType.Custom && !data.selectedTemplateId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${data.eventType} template is required`,
        path: ["selectedTemplateId"],
      });
    }

    // Custom validation for locations
    if (data.locationType === "single" && !data.singleLocation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Single location is required",
        path: ["singleLocation"],
      });
    }
    if (
      data.locationType === "multiple" &&
      (!data.multipleLocations ||
        data.multipleLocations.length === 0 ||
        data.multipleLocations.some((loc) => !loc))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one location is required and cannot be empty",
        path: ["multipleLocations"],
      });
    }
  });

export type EventCreationInput = z.infer<typeof eventCreationSchema>;

export interface Event {
  id: string;
  name: string;
  date: string; // e.g., "July 20, 2025"
  time: string; // e.g., "10:00 AM - 12:00 PM"
  location: string;
  description: string;
  participants: number;
  maxParticipants?: number;
  category: string;
  imageUrl?: string;
  isParticipating?: boolean;
}

export const mockEvents: Event[] = [
  {
    id: "e1",
    name: "Community Coding Session",
    date: "July 20, 2025",
    time: "10:00 AM - 12:00 PM",
    location: "Online (Zoom)",
    description:
      "A collaborative coding session for all skill levels. Bring your projects or join ours!",
    participants: 45,
    maxParticipants: 100,
    category: "Tech",
    imageUrl: "/placeholder.svg?height=200&width=300",
    isParticipating: true,
  },
  {
    id: "e2",
    name: "Local Park Cleanup",
    date: "August 5, 2025",
    time: "09:00 AM - 01:00 PM",
    location: "Central Park",
    description:
      "Help keep our local park clean and green. Gloves and bags provided.",
    participants: 20,
    maxParticipants: 50,
    category: "Community",
    imageUrl: "/placeholder.svg?height=200&width=300",
    isParticipating: true,
  },
  {
    id: "e3",
    name: "Photography Workshop",
    date: "September 1, 2025",
    time: "02:00 PM - 05:00 PM",
    location: "Art Gallery Downtown",
    description:
      "Learn the basics of digital photography from a professional. Bring your camera!",
    participants: 12,
    maxParticipants: 15,
    category: "Art",
    imageUrl: "/placeholder.svg?height=200&width=300",
    isParticipating: false,
  },
  {
    id: "e4",
    name: "Startup Pitch Night",
    date: "July 25, 2025",
    time: "06:00 PM - 09:00 PM",
    location: "Innovation Hub",
    description:
      "Watch local startups pitch their ideas to investors and a live audience.",
    participants: 80,
    maxParticipants: 150,
    category: "Business",
    imageUrl: "/placeholder.svg?height=200&width=300",
    isParticipating: false,
  },
  {
    id: "e5",
    name: "Yoga in the Park",
    date: "August 10, 2025",
    time: "07:00 AM - 08:00 AM",
    location: "Sunset Meadow Park",
    description:
      "Start your day with a refreshing outdoor yoga session. All levels welcome.",
    participants: 30,
    maxParticipants: 40,
    category: "Wellness",
    imageUrl: "/placeholder.svg?height=200&width=300",
    isParticipating: false,
  },
  {
    id: "e6",
    name: "Book Club Meeting: Sci-Fi",
    date: "August 15, 2025",
    time: "07:00 PM - 08:30 PM",
    location: "City Library",
    description:
      "Discussing 'Dune' by Frank Herbert. New members always welcome!",
    participants: 10,
    maxParticipants: 20,
    category: "Literature",
    imageUrl: "/placeholder.svg?height=200&width=300",
    isParticipating: false,
  },
  {
    id: "e7",
    name: "Hiking Trail Exploration",
    date: "September 10, 2025",
    time: "08:00 AM - 03:00 PM",
    location: "Mountain View Trails",
    description:
      "Explore scenic trails with fellow nature enthusiasts. Moderate difficulty.",
    participants: 18,
    maxParticipants: 25,
    category: "Outdoor",
    imageUrl: "/placeholder.svg?height=200&width=300",
    isParticipating: false,
  },
];

export const getParticipatingEvents = (): Event[] => {
  return mockEvents.filter((event) => event.isParticipating);
};

export const getSuggestedEvents = (): Event[] => {
  // For demonstration, let's suggest events that are not yet participated in
  // and have a 'Tech' or 'Business' category, or are generally popular.
  return mockEvents
    .filter(
      (event) =>
        !event.isParticipating &&
        (event.category === "Tech" ||
          event.category === "Business" ||
          event.participants > 20)
    )
    .slice(0, 3); // Limit to 3 suggested events
};

export const getAllEvents = (): Event[] => {
  return mockEvents;
};

// Mock storage for created events
const _mockCreatedEvents: CreatedEvent[] = [
  {
    id: "ce1",
    name: "My Awesome Wedding",
    date: "2025-10-26",
    time: "14:00",
    location: "Grand Ballroom",
    eventType: EventType.Wedding,
    templateName: "Classic Elegance",
    description: "The most important day of our lives!",
  },
  {
    id: "ce2",
    name: "John's 40th Birthday",
    date: "2025-11-15",
    time: "19:00",
    location: "Backyard Party",
    eventType: EventType.Birthday,
    templateName: "Fun & Festive",
    description: "A casual gathering with friends and family.",
  },
];

export interface CreatedEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string | string[];
  eventType: EventType;
  templateName?: string;
  description?: string;
}

export const saveEvent = async (
  eventData: EventCreationInput
): Promise<CreatedEvent> => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
  const newEvent: CreatedEvent = {
    id: `ce${_mockCreatedEvents.length + 1}`,
    name: eventData.eventName,
    date: eventData.eventDate,
    time: eventData.eventTime,
    location:
      eventData.locationType === "single"
        ? eventData.singleLocation
        : eventData.multipleLocations,
    eventType: eventData.eventType,
    templateName: eventData.selectedTemplateId
      ? getTemplatesByType(eventData.eventType).find(
          (t) => t.id === eventData.selectedTemplateId
        )?.name
      : undefined,
    description: eventData.description,
  };
  _mockCreatedEvents.push(newEvent);
  return newEvent;
};

export const getCreatedEvents = async (): Promise<CreatedEvent[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API call
  return [..._mockCreatedEvents]; // Return a copy to prevent direct modification
};
