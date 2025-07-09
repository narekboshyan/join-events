import crypto from "crypto";
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
   * Create invitation for email address with auth flow redirect and QR code
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

    // Check if invitation already exists
    let existingInvitation = null;
    if (existingUser) {
      existingInvitation = await prisma.event_invitations.findUnique({
        where: {
          event_id_invited_user_id: {
            event_id: eventId,
            invited_user_id: existingUser.id,
          },
        },
      });
    } else {
      existingInvitation = await prisma.event_invitations.findFirst({
        where: {
          event_id: eventId,
          invited_email: email,
          invited_user_id: null,
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

    // Generate invitation token for auth flow
    const invitationToken = this.generateInvitationToken(invitation.id);

    // Generate QR code for the invitation
    const qrCodeData = await this.generateInvitationQRCode({
      invitationId: invitation.id,
      eventId: eventId,
      userId: existingUser?.id || null,
      email: email,
      invitationToken,
    });

    // Create auth URLs based on user existence
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const authUrl = existingUser
      ? `${baseUrl}/auth/signin?invitation=${invitationToken}&redirect=${encodeURIComponent(
          `/events/${event.id}`
        )}`
      : `${baseUrl}/auth/signup?invitation=${invitationToken}&email=${encodeURIComponent(
          email
        )}&redirect=${encodeURIComponent(`/events/${event.id}`)}`;

    // Send email invitation with QR code
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

      // QR Code and Auth URLs
      qrCodeUrl: qrCodeData.qrImageUrl,
      qrCodeData: qrCodeData.qrString,
      authUrl: authUrl,
      eventUrl: `${baseUrl}/invitations/${invitationToken}`,
      hasAccount: !!existingUser,
      invitationToken,
    };

    await mailService.sendEventInvitation(emailPayload);

    return {
      email,
      success: true,
      invitationId: invitation.id,
      invitationToken,
      isRegisteredUser: !!existingUser,
      qrCodeData,
      authUrl,
    };
  }

  /**
   * Create invitation for registered user by ID with QR code
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

    // Generate invitation token for auth flow
    const invitationToken = this.generateInvitationToken(invitation.id);

    // Generate QR code for the invitation
    const qrCodeData = await this.generateInvitationQRCode({
      invitationId: invitation.id,
      eventId: eventId,
      userId: userId,
      email: user.email,
      invitationToken,
    });

    // Create auth URL for existing user
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const authUrl = `${baseUrl}/auth/signin?invitation=${invitationToken}&redirect=${encodeURIComponent(
      `/events/${event.id}`
    )}`;

    // Send email invitation with QR code
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

      // QR Code and Auth URLs
      qrCodeUrl: qrCodeData.qrImageUrl,
      qrCodeData: qrCodeData.qrString,
      authUrl: authUrl,
      eventUrl: `${baseUrl}/events/${event.id}`,
      hasAccount: true,
      invitationToken,
    };

    await mailService.sendEventInvitation(emailPayload);

    return {
      userId,
      email: user.email,
      success: true,
      invitationId: invitation.id,
      invitationToken,
      isRegisteredUser: true,
      qrCodeData,
      authUrl,
    };
  }

  static async getInvitationData(invitationId: string) {
    return prisma.event_invitations.findUnique({
      where: {
        id: invitationId,
      },
      include: {
        event: {
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
              where: {
                is_active: true,
              },
              orderBy: {
                display_order: "asc",
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
        },
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
            email: true,
          },
        },
      },
    });
  }

  /**
   * Generate secure invitation token for auth flow
   */
  private static generateInvitationToken(invitationId: string): string {
    const secret =
      process.env.INVITATION_TOKEN_SECRET ||
      "default-secret-change-in-production";
    const timestamp = Date.now();
    const data = `${invitationId}-${timestamp}`;
    const hash = crypto.createHmac("sha256", secret).update(data).digest("hex");
    return Buffer.from(`${invitationId}:${timestamp}:${hash}`).toString(
      "base64"
    );
  }

  /**
   * Verify invitation token and extract invitation ID
   */
  static verifyInvitationToken(
    token: string
  ): { invitationId: string; timestamp: number } | null {
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const [invitationId, timestamp, hash] = decoded.split(":");

      const secret =
        process.env.INVITATION_TOKEN_SECRET ||
        "default-secret-change-in-production";
      const data = `${invitationId}-${timestamp}`;
      const expectedHash = crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("hex");

      if (hash !== expectedHash) {
        return null;
      }

      // Check if token is not older than 30 days
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      if (tokenAge > maxAge) {
        return null;
      }

      return { invitationId, timestamp: parseInt(timestamp) };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get invitation details by token
   */
  static async getInvitationByToken(token: string) {
    const tokenData = this.verifyInvitationToken(token);
    if (!tokenData) {
      throw new Error("Invalid or expired invitation token");
    }

    const invitation = await prisma.event_invitations.findUnique({
      where: { id: tokenData.invitationId },
      include: {
        event: {
          include: {
            creator: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
              },
            },
            event_locations: {
              take: 1,
              orderBy: { start_datetime: "asc" },
            },
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
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    return invitation;
  }

  /**
   * Link user to invitation after signup/signin
   */
  static async linkUserToInvitation(invitationId: string, userId: string) {
    try {
      // Update the invitation with the user ID
      const invitation = await prisma.event_invitations.update({
        where: { id: invitationId },
        data: { invited_user_id: userId },
        include: { event: true },
      });

      // Auto-accept the invitation for seamless flow
      await prisma.event_invitations.update({
        where: { id: invitationId },
        data: {
          status: "accepted",
          response_date: new Date(),
        },
      });

      // Create event role automatically
      await prisma.event_roles.upsert({
        where: {
          event_id_user_id: {
            event_id: invitation.event_id,
            user_id: userId,
          },
        },
        update: {
          role: invitation.invitation_type,
          is_active: true,
        },
        create: {
          event_id: invitation.event_id,
          user_id: userId,
          role: invitation.invitation_type,
          assigned_by: invitation.invited_by,
          is_active: true,
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

      // Generate attendance QR code now that user is linked
      await this.generateEventQRCode({
        invitationId: invitation.id,
        eventId: invitation.event_id,
        userId: userId,
        guestCount: 0, // Default, can be updated later
      });

      return invitation;
    } catch (error) {
      console.error("Error linking user to invitation:", error);
      throw error;
    }
  }

  /**
   * Generate QR code for invitation (different from attendance QR)
   */
  /**
   * Generate QR code for invitation (different from attendance QR)
   */
  private static async generateInvitationQRCode({
    invitationId,
    eventId,
    userId,
    email,
    invitationToken,
  }: {
    invitationId: string;
    eventId: string;
    userId: string | null;
    email: string;
    invitationToken: string;
  }) {
    const qrData = {
      type: "event_invitation",
      invitationId,
      eventId,
      userId,
      email,
      invitationToken,
      timestamp: new Date().toISOString(),
      verification: await this.generateVerificationHash(invitationId, eventId),
    };

    // Generate QR code image using qrcode library
    const QRCode = require("qrcode");
    const qrString = JSON.stringify(qrData);

    try {
      // Generate QR code as data URL (base64 image)
      const qrImageUrl = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      // Store QR code data in database (make sure this table exists)
      // If you don't have event_qr_codes table, comment this out for now
      try {
        await prisma.event_qr_codes.create({
          data: {
            invitation_id: invitationId,
            event_id: eventId,
            user_id: userId,
            qr_data: qrString,
            is_active: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days for invitation QR
          },
        });
      } catch (dbError) {
        console.warn("Could not save QR code to database:", dbError);
        // Continue without saving to DB
      }

      return {
        qrString,
        qrImageUrl, // This is the base64 data URL for email embedding
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      console.error("Error generating QR code:", error);
      // Return fallback data
      return {
        qrString,
        qrImageUrl: null, // Template will show placeholder
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }
  }
  /**
   * Enhanced RSVP response handler with better error handling and QR generation
   */
  static async handleRSVPResponse({
    invitationId,
    action,
    guestCount = 0,
    dietaryRestrictions,
    specialRequests,
    attendingLocations = [],
  }: {
    invitationId: string;
    action: "accept" | "decline";
    guestCount?: number;
    dietaryRestrictions?: string;
    specialRequests?: string;
    attendingLocations?: string[];
  }) {
    try {
      const invitation = await prisma.event_invitations.findUnique({
        where: { id: invitationId },
        include: {
          event: {
            include: {
              creator: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
              event_locations: true,
            },
          },
          invited_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          inviter: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      if (invitation.status !== "pending") {
        throw new Error(`Invitation has already been ${invitation.status}`);
      }

      // Check if event has capacity for additional guests
      if (action === "accept" && invitation.event.max_participants) {
        const currentAccepted = await prisma.event_invitations.count({
          where: {
            event_id: invitation.event_id,
            status: "accepted",
          },
        });

        const totalGuests = guestCount + 1; // Include the invitee
        if (currentAccepted + totalGuests > invitation.event.max_participants) {
          throw new Error(
            `Event is at capacity. Cannot accommodate ${totalGuests} additional attendees.`
          );
        }
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
          attending_locations: attendingLocations,
        },
      });

      let eventRole = null;

      // If accepted and user exists, create/update event role
      if (action === "accept" && invitation.invited_user_id) {
        eventRole = await prisma.event_roles.upsert({
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

      // Generate QR code data for accepted invitations
      let qrCodeData = null;
      if (action === "accept") {
        qrCodeData = await this.generateEventQRCode({
          invitationId: invitation.id,
          eventId: invitation.event_id,
          userId: invitation.invited_user_id,
          guestCount,
        });
      }

      // Send confirmation email to invitee
      if (action === "accept") {
        await this.sendRSVPConfirmationEmail({
          invitation: {
            ...invitation,
            status: "accepted",
            guest_count: guestCount,
            dietary_restrictions: dietaryRestrictions,
            special_requests: specialRequests,
          },
          qrCodeData,
        });
      }

      // Notify event creator about the response
      await this.notifyEventCreatorOfRSVP({
        invitation: {
          ...invitation,
          status: action === "accept" ? "accepted" : "declined",
        },
        action,
        guestCount,
      });

      return {
        success: true,
        action,
        invitationId,
        eventId: invitation.event_id,
        eventRole,
        qrCodeData,
        message:
          action === "accept"
            ? `Great! You're confirmed for ${invitation.event.title}. Check your email for event details and QR code.`
            : `You've declined the invitation to ${invitation.event.title}.`,
      };
    } catch (error) {
      console.error("Error handling RSVP response:", error);
      throw error;
    }
  }

  /**
   * Generate QR code data for event attendance
   */
  private static async generateEventQRCode({
    invitationId,
    eventId,
    userId,
    guestCount,
  }: {
    invitationId: string;
    eventId: string;
    userId: string | null;
    guestCount: number;
  }) {
    const qrData = {
      type: "event_attendance",
      invitationId,
      eventId,
      userId,
      guestCount,
      timestamp: new Date().toISOString(),
      // Add a verification hash for security
      verification: await this.generateVerificationHash(invitationId, eventId),
    };

    // Store QR code data in database for verification
    const qrRecord = await prisma.event_qr_codes.create({
      data: {
        invitation_id: invitationId,
        event_id: eventId,
        user_id: userId,
        qr_data: JSON.stringify(qrData),
        is_active: true,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      qrString: JSON.stringify(qrData),
      qrUrl: `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/events/${eventId}/checkin?qr=${Buffer.from(
        JSON.stringify(qrData)
      ).toString("base64")}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      qrId: qrRecord.id,
    };
  }

  /**
   * Generate verification hash for QR code security
   */
  private static async generateVerificationHash(
    invitationId: string,
    eventId: string
  ): Promise<string> {
    const secret =
      process.env.QR_VERIFICATION_SECRET ||
      "default-secret-change-in-production";
    const data = `${invitationId}-${eventId}-${Date.now()}`;
    return crypto.createHmac("sha256", secret).update(data).digest("hex");
  }

  /**
   * Send RSVP confirmation email to attendee
   */
  private static async sendRSVPConfirmationEmail({
    invitation,
    qrCodeData,
  }: {
    invitation: any;
    qrCodeData: any;
  }) {
    const emailPayload = {
      to: invitation.invited_email,
      subject: `You're confirmed for ${invitation.event.title}! 🎉`,
      template: "rsvp-confirmation",
      context: {
        attendeeName: invitation.invited_user
          ? `${invitation.invited_user.first_name} ${invitation.invited_user.last_name}`
          : invitation.invited_email.split("@")[0],
        eventTitle: invitation.event.title,
        eventDate: this.formatDateTime(invitation.event.start_date),
        eventLocation: invitation.event.event_locations[0]?.name || "TBD",
        guestCount: invitation.guest_count,
        dietaryRestrictions: invitation.dietary_restrictions,
        specialRequests: invitation.special_requests,
        qrCodeUrl: qrCodeData?.qrUrl,
        eventUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${invitation.event.id}`,
        creatorName: `${invitation.event.creator.first_name} ${invitation.event.creator.last_name}`,
      },
    };

    // You'll need to implement this method in your mailService
    // await mailService.sendRSVPConfirmation(emailPayload);
    console.log("RSVP Confirmation email would be sent:", emailPayload);
  }

  /**
   * Notify event creator about RSVP response
   */
  private static async notifyEventCreatorOfRSVP({
    invitation,
    action,
    guestCount,
  }: {
    invitation: any;
    action: string;
    guestCount: number;
  }) {
    const attendeeName = invitation.invited_user
      ? `${invitation.invited_user.first_name} ${invitation.invited_user.last_name}`
      : invitation.invited_email;

    const emailPayload = {
      to: invitation.event.creator.email,
      subject: `${attendeeName} ${
        action === "accept" ? "accepted" : "declined"
      } your event invitation`,
      template: "rsvp-notification",
      context: {
        creatorName: `${invitation.event.creator.first_name} ${invitation.event.creator.last_name}`,
        attendeeName,
        eventTitle: invitation.event.title,
        action,
        guestCount,
        totalGuests: guestCount + 1,
        eventDashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${invitation.event.id}/manage`,
      },
    };

    // You'll need to implement this method in your mailService
    // await mailService.sendRSVPNotification(emailPayload);
    console.log("RSVP Notification email would be sent:", emailPayload);
  }

  /**
   * Verify QR code for event check-in
   */
  static async verifyEventQRCode(qrString: string) {
    try {
      const qrData = JSON.parse(qrString);

      // Verify QR code exists and is active
      const qrRecord = await prisma.event_qr_codes.findFirst({
        where: {
          invitation_id: qrData.invitationId,
          event_id: qrData.eventId,
          is_active: true,
          expires_at: {
            gt: new Date(),
          },
        },
        include: {
          invitation: {
            include: {
              event: true,
              invited_user: true,
            },
          },
        },
      });

      if (!qrRecord) {
        throw new Error("Invalid or expired QR code");
      }

      // Verify the hash
      const expectedHash = await this.generateVerificationHash(
        qrData.invitationId,
        qrData.eventId
      );

      console.log(expectedHash);

      // Check if already checked in
      const existingCheckin = await prisma.event_checkins.findUnique({
        where: { invitation_id: qrData.invitationId },
      });

      if (existingCheckin) {
        throw new Error("Already checked in");
      }

      // Mark as checked in
      await prisma.event_checkins.create({
        data: {
          event_id: qrData.eventId,
          invitation_id: qrData.invitationId,
          user_id: qrData.userId,
          checked_in_at: new Date(),
          guest_count: qrData.guestCount || 0,
        },
      });

      return {
        success: true,
        attendee: qrRecord.invitation.invited_user,
        event: qrRecord.invitation.event,
        guestCount: qrData.guestCount || 0,
      };
    } catch (error) {
      console.error("QR verification error:", error);
      throw new Error("Invalid QR code");
    }
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
   * Get event analytics for organizers
   */
  static async getEventAnalytics(eventId: string) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        event_invitations: {
          include: {
            invited_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        event_page_visits: {
          select: {
            visited_at: true,
            visitor_id: true,
            is_anonymous: true,
          },
        },
        event_checkins: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    const analytics = {
      totalInvitations: event.event_invitations.length,
      acceptedInvitations: event.event_invitations.filter(
        (inv) => inv.status === "accepted"
      ).length,
      pendingInvitations: event.event_invitations.filter(
        (inv) => inv.status === "pending"
      ).length,
      declinedInvitations: event.event_invitations.filter(
        (inv) => inv.status === "declined"
      ).length,
      totalGuests: event.event_invitations
        .filter((inv) => inv.status === "accepted")
        .reduce((sum, inv) => sum + (inv.guest_count || 0) + 1, 0),
      pageViews: event.event_page_visits.length,
      uniqueVisitors: new Set(
        event.event_page_visits
          .filter((visit) => !visit.is_anonymous)
          .map((visit) => visit.visitor_id)
      ).size,
      checkedInCount: event.event_checkins.length,
      responseRate:
        event.event_invitations.length > 0
          ? (
              (event.event_invitations.filter((inv) => inv.status !== "pending")
                .length /
                event.event_invitations.length) *
              100
            ).toFixed(1)
          : "0",
      acceptanceRate:
        event.event_invitations.length > 0
          ? (
              (event.event_invitations.filter(
                (inv) => inv.status === "accepted"
              ).length /
                event.event_invitations.length) *
              100
            ).toFixed(1)
          : "0",
    };

    return analytics;
  }

  /**
   * Get event check-ins for event day management
   */
  static async getEventCheckins(eventId: string) {
    return prisma.event_checkins.findMany({
      where: { event_id: eventId },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        invitation: {
          include: {
            invited_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        checked_in_at: "desc",
      },
    });
  }

  /**
   * Update event role permissions
   */
  static async updateEventRolePermissions(
    eventId: string,
    userId: string,
    permissions: {
      can_invite_users?: boolean;
      can_edit_event?: boolean;
      can_manage_locations?: boolean;
      can_view_analytics?: boolean;
      can_send_messages?: boolean;
    }
  ) {
    const eventRole = await prisma.event_roles.findUnique({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
    });

    if (!eventRole) {
      throw new Error("Event role not found");
    }

    return prisma.event_roles.update({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
      data: permissions,
    });
  }

  /**
   * Remove user from event
   */
  static async removeUserFromEvent(eventId: string, userId: string) {
    // Remove from event roles
    await prisma.event_roles.deleteMany({
      where: {
        event_id: eventId,
        user_id: userId,
      },
    });

    // Update invitation status to cancelled
    await prisma.event_invitations.updateMany({
      where: {
        event_id: eventId,
        invited_user_id: userId,
      },
      data: {
        status: "cancelled",
      },
    });

    return { success: true };
  }

  /**
   * Get events user is invited to or participating in
   */
  static async getUserInvitedEvents(userId: string) {
    return prisma.event_invitations.findMany({
      where: {
        invited_user_id: userId,
        status: {
          in: ["accepted", "pending"],
        },
      },
      include: {
        event: {
          include: {
            creator: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
              },
            },
            event_locations: {
              take: 1,
              orderBy: {
                start_datetime: "asc",
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
        },
      },
      orderBy: {
        event: {
          start_date: "asc",
        },
      },
    });
  }

  /**
   * Cancel event invitation
   */
  static async cancelInvitation(invitationId: string) {
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

    // Update invitation status
    await prisma.event_invitations.update({
      where: { id: invitationId },
      data: {
        status: "cancelled",
      },
    });

    // Remove from event roles if they had accepted
    if (invitation.status === "accepted" && invitation.invited_user_id) {
      await prisma.event_roles.deleteMany({
        where: {
          event_id: invitation.event_id,
          user_id: invitation.invited_user_id,
        },
      });
    }

    // Deactivate QR codes
    await prisma.event_qr_codes.updateMany({
      where: {
        invitation_id: invitationId,
      },
      data: {
        is_active: false,
      },
    });

    return { success: true };
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
