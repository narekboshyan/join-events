 
import { User } from "next-auth";
import prisma from "../db";
import { EventInvitationPayload } from "../services/email/interfaces/send-mail-template-payload.interface";
import { mailService } from "../services/email/mailer.service";
import { EventCreationInput, InviteFormData } from "../validations/event";

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

  /**
   * Send bulk event invitations with email notifications
   */
  static async sendBulkEventInvitations(
    input: InviteFormData,
    eventId: string,
    inviterId: string
  ) {
    try {
      console.log("Processing bulk invitations:", input);

      // Get event details with all related data
      const event = await prisma.events.findUnique({
        where: { id: eventId },
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          event_locations: {
            where: { is_active: true },
            orderBy: { display_order: "asc" },
          },
          event_roles: {
            where: { role: "participant" },
          },
        },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // Get inviter details (use inviterId parameter instead of event.creator.id)
      const inviter = await prisma.users.findUnique({
        where: { id: inviterId },
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      });

      if (!inviter) {
        throw new Error("Inviter not found");
      }

      const results = [];

      // Process email invitations
      if (input.emails && input.emails.length > 0) {
        for (const email of input.emails) {
          try {
            const result = await this.createInvitationForEmail({
              eventId,
              email,
              role: input.role,
              personalMessage: input.personalMessage,
              maxGuests: input.maxGuests,
              invitedBy: inviterId,
              event,
              inviter,
            });
            results.push(result);
          } catch (error) {
            console.error(`Failed to invite ${email}:`, error);
            results.push({
              email,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      }

      // Process user invitations (if you have selectedUsers in your form data)
      if (input.selectedUsers && input.selectedUsers.length > 0) {
        for (const user of input.selectedUsers) {
          try {
            const result = await this.createInvitationForUser({
              eventId: eventId,
              userId: user.id,
              role: input.role,
              personalMessage: input.personalMessage,
              maxGuests: input.maxGuests,
              invitedBy: inviterId,
              event,
              inviter,
            });
            results.push(result);
          } catch (error) {
            console.error(`Failed to invite user ${user.id}:`, error);
            results.push({
              userId: user.id,
              email: user.email,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      }

      console.log("Invitation results:", results);
      return results;
    } catch (error) {
      console.error("Error in sendBulkEventInvitations:", error);
      throw error;
    }
  }

  /**
   * Create invitation for email address (may or may not be registered user)
   */
  private static async createInvitationForEmail({
    eventId,
    email,
    role,
    personalMessage,
    maxGuests,
    invitedBy,
    event,
    inviter,
  }: {
    eventId: string;
    email: string;
    role: string;
    personalMessage?: string;
    maxGuests: number;
    invitedBy: string;
    event: any;
    inviter: any;
  }) {
    // Check if user exists with this email
    const existingUser = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });

    // Check if invitation already exists - handle both registered and unregistered users
    let existingInvitation = null;

    if (existingUser) {
      // Check by user ID for registered users
      existingInvitation = await prisma.event_invitations.findUnique({
        where: {
          event_id_invited_user_id: {
            event_id: eventId,
            invited_user_id: existingUser.id,
          },
        },
      });
    } else {
      // Check by email for unregistered users using findFirst
      existingInvitation = await prisma.event_invitations.findFirst({
        where: {
          event_id: eventId,
          invited_email: email,
          invited_user_id: null, // Only email-based invitations
        },
      });
    }

    if (existingInvitation) {
      throw new Error(
        `User with email ${email} is already invited to this event`
      );
    }

    // Create invitation record
    const invitation = await prisma.event_invitations.create({
      data: {
        event_id: eventId,
        invited_user_id: existingUser?.id || null,
        invited_email: email,
        invited_by: invitedBy,
        invitation_type: role,
        personal_message: personalMessage || null,
        max_guests: maxGuests,
        status: "pending",
      },
    });

    // Send email invitation
    const emailPayload: EventInvitationPayload = {
      to: email,
      invitedUserName: existingUser
        ? `${existingUser.first_name} ${existingUser.last_name}`
        : email.split("@")[0],
      inviterName: `${inviter.first_name} ${inviter.last_name}`,
      inviterEmail: inviter.email,
      invitationRole: role,
      personalMessage,

      // Event details
      eventTitle: event.title,
      eventDescription: event.description || undefined,
      eventType: event.type,
      eventCategory: event.category || "General",
      eventStartDate: this.formatDateTime(event.start_date),
      eventEndDate: this.formatDateTime(event.end_date),

      // Event settings
      isPaid: event.is_paid,
      price: event.price?.toString(),
      currency: event.currency || "USD",
      maxParticipants: event.max_participants || undefined,
      currentParticipants: event.event_roles.length,
      maxGuests,
      ageRestriction: event.age_restriction || undefined,
      dressCode: event.dress_code || undefined,
      requiresApproval: event.require_approval,

      // Locations
      locations: event.event_locations.map((location: any) => ({
        name: location.name,
        venueType: location.venue_type || undefined,
        address: location.address || undefined,
        startDatetime: this.formatDateTime(location.start_datetime),
        endDatetime: this.formatDateTime(location.end_datetime),
        capacity: location.capacity || undefined,
        onlineUrl: location.online_url || undefined,
        onlinePlatform: location.online_platform || undefined,
        meetingId: location.meeting_id || undefined,
        accessCode: location.access_code || undefined,
        specialInstructions: location.special_instructions || undefined,
        parkingInfo: location.parking_info || undefined,
        publicTransport: location.public_transport || undefined,
      })),

      // Action URLs
      acceptUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.slug}/rsvp?invitation=${invitation.id}&action=accept`,
      declineUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.slug}/rsvp?invitation=${invitation.id}&action=decline`,
      eventUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.slug}`,
    };

    await mailService.sendEventInvitation(emailPayload);

    return {
      email,
      success: true,
      invitationId: invitation.id,
      isRegisteredUser: !!existingUser,
    };
  }

  /**
   * Create invitation for registered user by ID
   */
  private static async createInvitationForUser({
    eventId,
    userId,
    role,
    personalMessage,
    maxGuests,
    invitedBy,
    event,
    inviter,
  }: {
    eventId: string;
    userId: string;
    role: string;
    personalMessage?: string;
    maxGuests: number;
    invitedBy: string;
    event: any;
    inviter: any;
  }) {
    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.event_invitations.findUnique({
      where: {
        event_id_invited_user_id: {
          event_id: eventId,
          invited_user_id: userId,
        },
      },
    });

    if (existingInvitation) {
      throw new Error(
        `User ${user.first_name} ${user.last_name} is already invited to this event`
      );
    }

    // Create invitation record
    const invitation = await prisma.event_invitations.create({
      data: {
        event_id: eventId,
        invited_user_id: userId,
        invited_email: user.email,
        invited_by: invitedBy,
        invitation_type: role,
        personal_message: personalMessage || null,
        max_guests: maxGuests,
        status: "pending",
      },
    });

    // Send email invitation (same as email-based invitation)
    const emailPayload: EventInvitationPayload = {
      to: user.email,
      invitedUserName: `${user.first_name} ${user.last_name}`,
      inviterName: `${inviter.first_name} ${inviter.last_name}`,
      inviterEmail: inviter.email,
      invitationRole: role,
      personalMessage,

      // Event details
      eventTitle: event.title,
      eventDescription: event.description || undefined,
      eventType: event.type,
      eventCategory: event.category || "General",
      eventStartDate: this.formatDateTime(event.start_date),
      eventEndDate: this.formatDateTime(event.end_date),

      // Event settings
      isPaid: event.is_paid,
      price: event.price?.toString(),
      currency: event.currency || "USD",
      maxParticipants: event.max_participants || undefined,
      currentParticipants: event.event_roles.length,
      maxGuests,
      ageRestriction: event.age_restriction || undefined,
      dressCode: event.dress_code || undefined,
      requiresApproval: event.require_approval,

      // Locations
      locations: event.event_locations.map((location: any) => ({
        name: location.name,
        venueType: location.venue_type || undefined,
        address: location.address || undefined,
        startDatetime: this.formatDateTime(location.start_datetime),
        endDatetime: this.formatDateTime(location.end_datetime),
        capacity: location.capacity || undefined,
        onlineUrl: location.online_url || undefined,
        onlinePlatform: location.online_platform || undefined,
        meetingId: location.meeting_id || undefined,
        accessCode: location.access_code || undefined,
        specialInstructions: location.special_instructions || undefined,
        parkingInfo: location.parking_info || undefined,
        publicTransport: location.public_transport || undefined,
      })),

      // Action URLs
      acceptUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.slug}/rsvp?invitation=${invitation.id}&action=accept`,
      declineUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.slug}/rsvp?invitation=${invitation.id}&action=decline`,
      eventUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.slug}`,
    };

    await mailService.sendEventInvitation(emailPayload);

    return {
      userId,
      email: user.email,
      success: true,
      invitationId: invitation.id,
      isRegisteredUser: true,
    };
  }

  /**
   * Handle RSVP response from email links
   */
  static async handleRSVPResponse({
    invitationId,
    action,
    guestCount = 0,
    dietaryRestrictions,
    specialRequests,
  }: {
    invitationId: string;
    action: "accept" | "decline";
    guestCount?: number;
    dietaryRestrictions?: string;
    specialRequests?: string;
  }) {
    const invitation = await prisma.event_invitations.findUnique({
      where: { id: invitationId },
      include: {
        event: true,
        invited_user: true,
      },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation has already been responded to");
    }

    // Update invitation status
    await prisma.event_invitations.update({
      where: { id: invitationId },
      data: {
        status: action === "accept" ? "accepted" : "declined",
        response_date: new Date(),
        guest_count: guestCount,
        dietary_restrictions: dietaryRestrictions,
        special_requests: specialRequests,
      },
    });

    // If accepted and user exists, create/update event role
    if (action === "accept" && invitation.invited_user_id) {
      await prisma.event_roles.upsert({
        where: {
          event_id_user_id: {
            event_id: invitation.event_id,
            user_id: invitation.invited_user_id,
          },
        },
        update: {
          role: invitation.invitation_type,
          is_active: true,
        },
        create: {
          event_id: invitation.event_id,
          user_id: invitation.invited_user_id,
          role: invitation.invitation_type,
          assigned_by: invitation.invited_by,
          is_active: true,
          // Set permissions based on role
          can_invite_users:
            invitation.invitation_type === "admin" ||
            invitation.invitation_type === "co_admin",
          can_edit_event:
            invitation.invitation_type === "admin" ||
            invitation.invitation_type === "co_admin",
          can_manage_locations:
            invitation.invitation_type === "admin" ||
            invitation.invitation_type === "co_admin" ||
            invitation.invitation_type === "organizer",
          can_view_analytics:
            invitation.invitation_type === "admin" ||
            invitation.invitation_type === "co_admin",
          can_send_messages: invitation.invitation_type !== "participant",
        },
      });
    }

    return {
      success: true,
      action,
      invitationId,
      eventId: invitation.event_id,
    };
  }

  /**
   * Get event invitations with filters
   */
  static async getEventInvitations(eventId: string, status?: string) {
    return prisma.event_invitations.findMany({
      where: {
        event_id: eventId,
        ...(status && { status }),
      },
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
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  /**
   * Resend invitation
   */
  static async resendInvitation(invitationId: string) {
    const invitation = await prisma.event_invitations.findUnique({
      where: { id: invitationId },
      include: {
        event: {
          include: {
            creator: true,
            event_locations: true,
            event_roles: { where: { role: "participant" } },
          },
        },
        invited_user: true,
        inviter: true,
      },
    });

    if (!invitation || invitation.status !== "pending") {
      throw new Error("Invitation not found or already responded");
    }

    // Update reminder count
    await prisma.event_invitations.update({
      where: { id: invitationId },
      data: {
        reminder_count: invitation.reminder_count + 1,
        reminder_sent_at: new Date(),
      },
    });

    // Resend the invitation email
    if (invitation.invited_user_id) {
      await this.createInvitationForUser({
        eventId: invitation.event_id,
        userId: invitation.invited_user_id,
        role: invitation.invitation_type,
        personalMessage: `REMINDER: ${invitation.personal_message || ""}`,
        maxGuests: invitation.max_guests,
        invitedBy: invitation.invited_by,
        event: invitation.event,
        inviter: invitation.inviter,
      });
    } else if (invitation.invited_email) {
      await this.createInvitationForEmail({
        eventId: invitation.event_id,
        email: invitation.invited_email,
        role: invitation.invitation_type,
        personalMessage: `REMINDER: ${invitation.personal_message || ""}`,
        maxGuests: invitation.max_guests,
        invitedBy: invitation.invited_by,
        event: invitation.event,
        inviter: invitation.inviter,
      });
    }

    return { success: true, invitationId };
  }

  /**
   * Format datetime for email display
   */
  private static formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(date));
  }
}
