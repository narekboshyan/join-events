import { User } from "next-auth";
import prisma from "../db";
import { EventCreationInput } from "../validations/event";

export interface CreateEventInput
  extends Omit<EventCreationInput, "locations"> {
  created_by?: string;
  admin_notes?: string;
}

export class EventResolver {
  static getAllEvents() {
    return prisma.events.findMany({
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
          },
        },
        event_locations: true,
        _count: {
          select: {
            event_invitations: {
              where: {
                status: "accepted",
              },
            },
          },
        },
        event_attachments: {
          include: {
            attachment: true,
          },
        },
      },
      // where: {
      //   status: "published",
      //   is_public: true,
      // },
      orderBy: {
        start_date: "asc",
      },
    });
  }

  static async createEvent(input: EventCreationInput, user: User) {
    console.log({ user, input });

    try {
      // Generate slug from title
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      // Combine date and time for start and end datetimes
      const startDateTime = new Date(`${input.start_date}T${input.start_time}`);
      const endDateTime = new Date(`${input.end_date}T${input.end_time}`);

      // Start a transaction to create event and assign creator as admin
      const result = await prisma.$transaction(async (tx) => {
        // Create the event
        const event = await tx.events.create({
          data: {
            title: input.title,
            slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
            description: input.description || null,
            type: input.type,
            start_date: startDateTime,
            end_date: endDateTime,
            timezone: input.timezone || "UTC",
            is_public: input.is_public ?? true,
            is_paid: input.is_paid ?? false,
            price: input.price || null,
            currency: input.currency || "USD",
            max_participants: input.max_participants || null,
            min_participants: input.min_participants || null,
            auto_approve: input.auto_approve ?? true,
            allow_guests: input.allow_guests ?? false,
            require_approval: input.require_approval ?? false,
            category: input.category || null,
            tags: input.tags || [],
            age_restriction: input.age_restriction || null,
            dress_code: input.dress_code || null,
            created_by: user.id, // Use the user ID from session
            admin_notes: null,
            status: "draft", // Start as draft
          },
          include: {
            creator: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
                email: true,
              },
            },
          },
        });

        // Automatically assign creator as admin with full permissions
        await tx.event_roles.create({
          data: {
            event_id: event.id,
            user_id: user.id, // Use the user ID from session
            role: "admin",
            can_invite_users: true,
            can_edit_event: true,
            can_manage_locations: true,
            can_view_analytics: true,
            can_send_messages: true,
            is_active: true,
          },
        });

        // Create locations for the event
        if (input.locations && input.locations.length > 0) {
          for (const location of input.locations) {
            if (location.name.trim()) {
              await tx.event_locations.create({
                data: {
                  event_id: event.id,
                  name: location.name,
                  venue_type: location.venue_type || "primary",
                  address: location.address || null,
                  city: location.city || null,
                  state: location.state || null,
                  country: location.country || null,
                  online_url:
                    input.type === "online" ? location.online_url : null,
                  online_platform:
                    input.type === "online" ? location.online_platform : null,
                  start_datetime: startDateTime,
                  end_datetime: endDateTime,
                  display_order: 0,
                  is_active: true,
                },
              });
            }
          }
        }

        return event;
      });

      return result;
    } catch (error) {
      console.error("Error creating event:", error);

      // More specific error handling
      if (error instanceof Error) {
        throw new Error(`Failed to create event: ${error.message}`);
      }
      throw new Error("Failed to create event: Unknown error");
    }
  }

  static async getEventById(eventId: string) {
    return prisma.events.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
          },
        },
        event_locations: {
          orderBy: {
            start_datetime: "asc",
          },
        },
        event_attachments: {
          include: {
            attachment: true,
          },
          orderBy: {
            display_order: "asc",
          },
        },
        event_roles: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
                email: true,
              },
            },
          },
        },
        event_invitations: {
          include: {
            invited_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
                email: true,
              },
            },
            inviter: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            event_invitations: {
              where: {
                status: "accepted",
              },
            },
          },
        },
      },
    });
  }

  static async getUserEvents(userId: string) {
    return prisma.events.findMany({
      where: {
        created_by: userId,
      },
      include: {
        event_attachments: {
          include: {
            attachment: true,
          },
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
          },
        },
        event_locations: true,
        _count: {
          select: {
            event_invitations: {
              where: {
                status: "accepted",
              },
            },
          },
        },
      },
      orderBy: {
        start_date: "asc",
      },
    });
  }
}
