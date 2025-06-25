/* eslint-disable no-unused-vars */
import { z } from "zod";

// Event categories enum
export enum EventCategory {
  Birthday = "birthday",
  Wedding = "wedding",
  Party = "party",
  Business = "business",
  Social = "social",
  Proposal = "proposal",
  Custom = "custom",
}

// Event types enum
export enum EventType {
  Online = "online",
  Offline = "offline",
  Hybrid = "hybrid",
}

// Location validation schema - Fixed to match form exactly
const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  venue_type: z.enum(["primary", "secondary", "meeting_point", "backup"]),
  online_url: z.string().optional(),
  online_platform: z.string().optional(),
});

// Base schema without refinements for partial operations
const baseEventSchema = z.object({
  // Basic Information
  title: z
    .string()
    .min(1, "Event title is required")
    .max(255, "Title is too long"),

  description: z.string().optional(),

  category: z.nativeEnum(EventCategory, {
    errorMap: () => ({ message: "Please select a valid event category" }),
  }),

  type: z.nativeEnum(EventType, {
    errorMap: () => ({ message: "Please select a valid event type" }),
  }),

  // Date and Time - Fixed to match form defaults
  start_date: z.string().min(1, "Start date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_date: z.string().min(1, "End date is required"),
  end_time: z.string().min(1, "End time is required"),
  timezone: z.string(), // Required string to match form default

  // Event Settings - Fixed to match form defaults
  is_public: z.boolean(),
  is_paid: z.boolean(),
  price: z.number().optional(),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "CNY"]),
  max_participants: z.number().optional(),
  min_participants: z.number().optional(),
  auto_approve: z.boolean(),
  allow_guests: z.boolean(),
  require_approval: z.boolean(),

  // Optional Settings - Fixed to match form
  age_restriction: z.string().optional(),
  dress_code: z.string().optional(),
  tags: z.array(z.string()),
  selectedTemplateId: z.string().optional(),

  // Locations - Fixed to match form structure
  locations: z
    .array(locationSchema)
    .min(1, "At least one location is required"),
});

// Main event creation validation schema with business logic refinements
export const eventCreationSchema = baseEventSchema
  .refine(
    (data) => {
      // Validate that end date/time is after start date/time
      if (
        !data.start_date ||
        !data.start_time ||
        !data.end_date ||
        !data.end_time
      ) {
        return true; // Let individual field validation handle missing values
      }
      const startDateTime = new Date(`${data.start_date}T${data.start_time}`);
      const endDateTime = new Date(`${data.end_date}T${data.end_time}`);
      return endDateTime > startDateTime;
    },
    {
      message: "End date and time must be after start date and time",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      // If paid event, price must be provided
      if (data.is_paid && (!data.price || data.price <= 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Price is required for paid events and must be greater than 0",
      path: ["price"],
    }
  )
  .refine(
    (data) => {
      // Validate min/max participants relationship
      if (data.min_participants && data.max_participants) {
        return data.min_participants <= data.max_participants;
      }
      return true;
    },
    {
      message:
        "Minimum participants cannot be greater than maximum participants",
      path: ["min_participants"],
    }
  )
  .refine(
    (data) => {
      // For online events, at least one location should have online details
      if (data.type === EventType.Online) {
        const hasOnlineDetails = data.locations.some(
          (loc) => loc.online_url && loc.online_url.trim().length > 0
        );
        return hasOnlineDetails;
      }
      return true;
    },
    {
      message: "Online events must have at least one location with meeting URL",
      path: ["locations"],
    }
  )
  .refine(
    (data) => {
      // For offline events, at least one location should have physical address details
      if (data.type === EventType.Offline) {
        const hasPhysicalDetails = data.locations.some(
          (loc) =>
            (loc.address && loc.address.trim().length > 0) ||
            (loc.city && loc.city.trim().length > 0)
        );
        return hasPhysicalDetails;
      }
      return true;
    },
    {
      message:
        "Offline events must have at least one location with address or city",
      path: ["locations"],
    }
  )
  .refine(
    (data) => {
      // Validate start date is not in the past
      if (data.start_date) {
        const selectedDate = new Date(data.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      }
      return true;
    },
    {
      message: "Start date cannot be in the past",
      path: ["start_date"],
    }
  );

// Infer the TypeScript type from the schema
export type EventCreationInput = z.infer<typeof eventCreationSchema>;

// Additional validation schemas for specific use cases
export const eventUpdateSchema = baseEventSchema.partial().extend({
  id: z.string().min(1, "Event ID is required"),
});

export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

// Schema for event search/filtering
export const eventFilterSchema = z.object({
  category: z.nativeEnum(EventCategory).optional(),
  type: z.nativeEnum(EventType).optional(),
  status: z.enum(["draft", "published", "cancelled", "completed"]).optional(),
  is_public: z.boolean().optional(),
  is_paid: z.boolean().optional(),
  start_date_from: z.string().optional(),
  start_date_to: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type EventFilterInput = z.infer<typeof eventFilterSchema>;

// Validation for individual location (useful for dynamic forms)
export const singleLocationSchema = locationSchema;
export type LocationInput = z.infer<typeof singleLocationSchema>;

// Custom validation helpers
export const validateEventDuration = (
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
) => {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  return {
    isValid: diffInHours > 0,
    duration: diffInHours,
    isTooLong: diffInHours > 24 * 7, // More than a week
    isTooShort: diffInHours < 0.25, // Less than 15 minutes
  };
};

export const validateEventDate = (date: string) => {
  const eventDate = new Date(date);
  const today = new Date();
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(today.getFullYear() + 2); // 2 years in the future

  return {
    isValid: eventDate >= today && eventDate <= maxFutureDate,
    isPast: eventDate < today,
    isTooFarInFuture: eventDate > maxFutureDate,
  };
};

// Error messages constants
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_URL: "Please enter a valid URL",
  INVALID_DATE: "Please enter a valid date",
  INVALID_TIME: "Please enter a valid time",
  DATE_IN_PAST: "Date cannot be in the past",
  END_BEFORE_START: "End date/time must be after start date/time",
  PRICE_REQUIRED_FOR_PAID: "Price is required for paid events",
  MIN_MAX_PARTICIPANTS: "Minimum cannot be greater than maximum participants",
  ONLINE_URL_REQUIRED: "Meeting URL is required for online events",
  PHYSICAL_ADDRESS_REQUIRED: "Address or city is required for offline events",
  TOO_MANY_TAGS: "Maximum 10 tags allowed",
  DUPLICATE_TAGS: "Duplicate tags are not allowed",
  INVALID_LOCATION_COUNT: "At least one location is required",
  PRIMARY_LOCATION_REQUIRED: "At least one primary location is required",
} as const;

export const inviteFormSchema = z.object({
  emails: z
    .array(z.string().email("Invalid email address"))
    .min(1, "At least one email is required")
    .refine(
      (emails) => new Set(emails).size === emails.length,
      "Duplicate emails are not allowed"
    ),
  selectedUsers: z
    .array(
      z.object({
        id: z.string(),
        first_name: z.string(),
        last_name: z.string(),
        email: z.string().email(),
        username: z.string(),
      })
    )
    .optional(),
  role: z.string().min(1, "Role is required"),
  personalMessage: z.string().optional(),
  maxGuests: z.number().min(0).max(10),
  currentEmail: z.string().optional(), // For the email input field
});

export type InviteFormData = z.infer<typeof inviteFormSchema>;
