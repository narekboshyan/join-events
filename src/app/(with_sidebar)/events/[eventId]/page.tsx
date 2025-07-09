import React from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  Clock,
  Crown,
  DollarSign,
  Edit,
  Globe,
  Heart,
  Lock,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  PartyPopper,
  Settings,
  Share2,
  Shield,
  Tag,
  Trash2,
  User,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import InviteUsersModal from "@/components/InviteUsersModal";
import { auth } from "@/lib/auth";
import { EventResolver } from "@/lib/resolvers/event.resolver";

// Enhanced permission checker utility
const checkPermissions = (userRole: any, isCreator: boolean) => {
  const basePermissions = {
    canInviteUsers: false,
    canEditEvent: false,
    canManageLocations: false,
    canViewAnalytics: false,
    canSendMessages: false,
    canManageRoles: false,
    canDeleteEvent: false,
    canModerateParticipants: false,
    canViewSensitiveInfo: false,
    canManageContent: false,
  };

  if (isCreator) {
    return Object.keys(basePermissions).reduce((acc, key) => {
      acc[key as keyof typeof basePermissions] = true;
      return acc;
    }, {} as typeof basePermissions);
  }

  if (!userRole) return basePermissions;

  // Define permissions based on role
  const rolePermissions = {
    co_admin: {
      canInviteUsers: true,
      canEditEvent: true,
      canManageLocations: true,
      canViewAnalytics: true,
      canSendMessages: true,
      canManageRoles: true,
      canDeleteEvent: false,
      canModerateParticipants: true,
      canViewSensitiveInfo: true,
      canManageContent: true,
    },
    organizer: {
      canInviteUsers: true,
      canEditEvent: true,
      canManageLocations: true,
      canViewAnalytics: true,
      canSendMessages: true,
      canManageRoles: false,
      canDeleteEvent: false,
      canModerateParticipants: true,
      canViewSensitiveInfo: false,
      canManageContent: true,
    },
    moderator: {
      canInviteUsers: true,
      canEditEvent: false,
      canManageLocations: false,
      canViewAnalytics: true,
      canSendMessages: true,
      canManageRoles: false,
      canDeleteEvent: false,
      canModerateParticipants: true,
      canViewSensitiveInfo: false,
      canManageContent: false,
    },
    participant: {
      canInviteUsers: false,
      canEditEvent: false,
      canManageLocations: false,
      canViewAnalytics: false,
      canSendMessages: false,
      canManageRoles: false,
      canDeleteEvent: false,
      canModerateParticipants: false,
      canViewSensitiveInfo: false,
      canManageContent: false,
    },
  };

  const currentRolePermissions =
    rolePermissions[userRole.role as keyof typeof rolePermissions] || {};

  // Merge with explicit permissions from database
  return {
    ...basePermissions,
    ...currentRolePermissions,
    // Override with explicit database permissions if they exist
    canInviteUsers:
      userRole.can_invite_users ||
      currentRolePermissions.canInviteUsers ||
      false,
    canEditEvent:
      userRole.can_edit_event || currentRolePermissions.canEditEvent || false,
    canManageLocations:
      userRole.can_manage_locations ||
      currentRolePermissions.canManageLocations ||
      false,
    canViewAnalytics:
      userRole.can_view_analytics ||
      currentRolePermissions.canViewAnalytics ||
      false,
    canSendMessages:
      userRole.can_send_messages ||
      currentRolePermissions.canSendMessages ||
      false,
  };
};

const SingleEventPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) => {
  const event = await EventResolver.getEventById((await params).eventId);
  const session = await auth();

  const currentUserId = session?.user.id;

  // Determine user permissions
  const isCreator = event?.created_by === currentUserId;
  const userRole = event?.event_roles?.find(
    (role) => role.user_id === currentUserId
  );

  const permissions = checkPermissions(userRole, isCreator);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">
            The event you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Format dates
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedStartTime = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const formattedEndTime = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Get creator initials
  const creatorInitials = event.creator
    ? `${event.creator.first_name?.[0] || ""}${
        event.creator.last_name?.[0] || ""
      }`.toUpperCase()
    : "U";

  // Get accepted invitations count
  const acceptedCount = event._count?.event_invitations || 0;

  // Get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "birthday":
        return <Crown className="w-4 h-4" />;
      case "party":
        return <PartyPopper className="w-4 h-4" />;
      case "wedding":
        return <Heart className="w-4 h-4" />;
      default:
        return <PartyPopper className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-80 bg-gradient-to-r from-brand-purple to-brand-pink rounded-b-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                {event.is_public ? (
                  <Globe className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {event.is_public ? "Public Event" : "Private Event"}
                </span>
              </div>
              {event.type && (
                <div className="inline-flex items-center gap-1 bg-brand-yellow/20 backdrop-blur-sm rounded-full px-3 py-1">
                  {getEventTypeIcon(event.type)}
                  <span className="text-sm capitalize">{event.type}</span>
                </div>
              )}
              {event.is_paid && (
                <div className="inline-flex items-center gap-1 bg-brand-orange/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">
                    {event.currency} {event.price?.toString()}
                  </span>
                </div>
              )}
              {event.category && (
                <div className="inline-flex items-center gap-1 bg-brand-pink/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm capitalize">{event.category}</span>
                </div>
              )}
              {/* Show role badge if user has a special role */}
              {userRole && userRole.role !== "participant" && (
                <div className="inline-flex items-center gap-1 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm capitalize">
                    {userRole.role.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {formattedStartTime} - {formattedEndTime}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{acceptedCount} going</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          {/* Show analytics button for those with permission */}
          {permissions.canViewAnalytics && (
            <button
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              title="View Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          )}
          {/* Show settings button for those with edit permission */}
          {permissions.canEditEvent && (
            <button
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              title="Event Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Join Event Card */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center">
                    {getEventTypeIcon(event.type || "party")}
                  </div>
                  <div>
                    <h3 className="font-semibold">Join the Celebration!</h3>
                    <p className="text-sm text-muted-foreground">
                      Let {event.creator?.first_name || "the host"} know you're
                      coming
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button className="bg-brand-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-purple/90 transition-colors">
                    I'm Going! 🎉
                  </button>
                  {permissions.canInviteUsers && (
                    <InviteUsersModal
                      eventId={event.id}
                      isCreator={isCreator}
                      canInviteUsers={permissions.canInviteUsers}
                      currentUserId={currentUserId}
                      triggerButton={
                        <button className="bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-brand-pink/90 transition-colors flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          {isCreator ? "Invite & Assign" : "Invite Friends"}
                        </button>
                      }
                    />
                  )}
                  {/* Message button for those with permission */}
                  {permissions.canSendMessages && (
                    <button className="bg-brand-yellow text-brand-purple px-4 py-3 rounded-lg font-medium hover:bg-brand-yellow/90 transition-colors flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Send Message
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Event Management Card - Role-based access */}
            {(isCreator ||
              permissions.canEditEvent ||
              permissions.canManageRoles ||
              permissions.canViewAnalytics) && (
              <div className="bg-card rounded-xl p-6 shadow-sm border border-brand-purple/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-purple/10 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-purple">
                      Event Management
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isCreator
                        ? "Full event control and management"
                        : `${userRole?.role?.replace("_", " ")} privileges`}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Invite Users - for those with invite permission */}
                  {permissions.canInviteUsers && (
                    <InviteUsersModal
                      eventId={event.id}
                      isCreator={isCreator}
                      canInviteUsers={permissions.canInviteUsers}
                      currentUserId={currentUserId}
                      triggerButton={
                        <button className="bg-brand-purple/10 text-brand-purple px-4 py-2 rounded-lg font-medium hover:bg-brand-purple/20 transition-colors flex items-center gap-2 justify-center">
                          <UserPlus className="w-4 h-4" />
                          Invite Users
                        </button>
                      }
                    />
                  )}

                  {/* Manage Roles - for creators and co-admins */}
                  {permissions.canManageRoles && (
                    <button className="bg-brand-yellow/10 text-brand-purple px-4 py-2 rounded-lg font-medium hover:bg-brand-yellow/20 transition-colors flex items-center gap-2 justify-center">
                      <Users className="w-4 h-4" />
                      Manage Roles
                    </button>
                  )}

                  {/* Edit Event - for those with edit permission */}
                  {permissions.canEditEvent && (
                    <button className="bg-brand-orange/10 text-brand-purple px-4 py-2 rounded-lg font-medium hover:bg-brand-orange/20 transition-colors flex items-center gap-2 justify-center">
                      <Edit className="w-4 h-4" />
                      Edit Event
                    </button>
                  )}

                  {/* Manage Locations - for those with location permission */}
                  {permissions.canManageLocations && (
                    <button className="bg-brand-pink/10 text-brand-purple px-4 py-2 rounded-lg font-medium hover:bg-brand-pink/20 transition-colors flex items-center gap-2 justify-center">
                      <MapPin className="w-4 h-4" />
                      Manage Venues
                    </button>
                  )}

                  {/* View Analytics - for those with analytics permission */}
                  {permissions.canViewAnalytics && (
                    <button className="bg-blue-50 text-brand-purple px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2 justify-center">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                  )}

                  {/* Moderate Participants - for moderators and above */}
                  {permissions.canModerateParticipants && (
                    <button className="bg-red-50 text-brand-purple px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2 justify-center">
                      <Shield className="w-4 h-4" />
                      Moderate
                    </button>
                  )}

                  {/* Send Notifications - for those with message permission */}
                  {permissions.canSendMessages && (
                    <button className="bg-green-50 text-brand-purple px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center gap-2 justify-center">
                      <Bell className="w-4 h-4" />
                      Notify All
                    </button>
                  )}

                  {/* Delete Event - only for creator */}
                  {isCreator && (
                    <button className="bg-red-500/10 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2 justify-center">
                      <Trash2 className="w-4 h-4" />
                      Delete Event
                    </button>
                  )}
                </div>

                {/* Role-specific information */}
                {userRole && !isCreator && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-brand-purple" />
                      <span className="font-medium">Your Role:</span>
                      <span className="capitalize">
                        {userRole.role.replace("_", " ")}
                      </span>
                    </div>
                    {userRole.role_notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {userRole.role_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Event Description */}
            {event.description && (
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">About This Event</h2>
                  {permissions.canManageContent && (
                    <button className="text-brand-purple hover:text-brand-purple/80 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Enhanced Event Team Section - with management capabilities */}
            {(isCreator || permissions.canViewAnalytics) &&
              event.event_roles &&
              event.event_roles.length > 0 && (
                <div className="bg-card rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Event Team</h2>
                    {permissions.canManageRoles && (
                      <button className="text-brand-purple hover:text-brand-purple/80 transition-colors flex items-center gap-1 text-sm">
                        <UserPlus className="w-4 h-4" />
                        Add Team Member
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {event.event_roles
                      .filter((role) => role.is_active)
                      .map((role) => {
                        const userInitials = role.user
                          ? `${role.user.first_name?.[0] || ""}${
                              role.user.last_name?.[0] || ""
                            }`.toUpperCase()
                          : "U";

                        const getRoleIcon = (roleType: string) => {
                          switch (roleType) {
                            case "admin":
                              return (
                                <Crown className="w-4 h-4 text-brand-purple" />
                              );
                            case "co_admin":
                              return (
                                <Crown className="w-4 h-4 text-brand-pink" />
                              );
                            case "organizer":
                              return (
                                <Users className="w-4 h-4 text-brand-yellow" />
                              );
                            case "moderator":
                              return (
                                <Shield className="w-4 h-4 text-brand-orange" />
                              );
                            default:
                              return <User className="w-4 h-4 text-gray-500" />;
                          }
                        };

                        return (
                          <div
                            key={role.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center text-white font-medium">
                                {userInitials}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {role.user
                                    ? `${role.user.first_name || ""} ${
                                        role.user.last_name || ""
                                      }`.trim()
                                    : "Unknown User"}
                                </p>
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(role.role)}
                                  <span className="text-sm text-muted-foreground capitalize">
                                    {role.role.replace("_", " ")}
                                  </span>
                                </div>
                                {permissions.canViewSensitiveInfo &&
                                  role.role_notes && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {role.role_notes}
                                    </p>
                                  )}
                              </div>
                            </div>

                            {/* Action buttons for role management */}
                            {permissions.canManageRoles &&
                              role.user_id !== currentUserId && (
                                <div className="flex items-center gap-2">
                                  <button
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title="Edit Role"
                                  >
                                    <Edit className="w-3 h-3 text-gray-600" />
                                  </button>
                                  <button
                                    className="p-1 hover:bg-red-100 rounded transition-colors"
                                    title="Remove Role"
                                  >
                                    <UserX className="w-3 h-3 text-red-600" />
                                  </button>
                                </div>
                              )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

            {/* Rest of the existing components... */}
            {/* Venues, Tags, Event Rules, etc. remain the same but can add edit buttons based on permissions */}
          </div>

          {/* Enhanced Sidebar with role-based content */}
          <div className="space-y-6">
            {/* Host Information - Enhanced for different roles */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">
                {isCreator ? "You're the Host" : "Hosted by"}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold">
                  {creatorInitials}
                </div>
                <div>
                  <h4 className="font-medium">
                    {event.creator
                      ? `${event.creator.first_name || ""} ${
                          event.creator.last_name || ""
                        }`.trim()
                      : "Unknown Host"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {isCreator ? "Event Creator" : "Event Organizer"}
                  </p>
                  {event.creator?.username && (
                    <p className="text-xs text-muted-foreground">
                      @{event.creator.username}
                    </p>
                  )}
                </div>
              </div>
              {!isCreator && (
                <button className="w-full bg-brand-yellow text-brand-purple font-medium py-2 rounded-lg hover:bg-brand-yellow/90 transition-colors">
                  Message Host
                </button>
              )}
              {isCreator && (
                <div className="text-center p-2 bg-brand-purple/10 rounded-lg">
                  <p className="text-sm text-brand-purple font-medium">
                    This is your event! 🎉
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Event Stats - Show different stats based on role */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">
                {permissions.canViewAnalytics
                  ? "Event Analytics"
                  : "Event Stats"}
              </h3>
              <div className="space-y-3">
                {event.max_participants && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Max Capacity
                    </span>
                    <span className="font-medium">
                      {event.max_participants} people
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Going</span>
                  <span className="font-medium">{acceptedCount} people</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Invites
                  </span>
                  <span className="font-medium">
                    {event.event_invitations?.length || 0} people
                  </span>
                </div>

                {/* Additional analytics for privileged users */}
                {permissions.canViewAnalytics && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Pending Responses
                      </span>
                      <span className="font-medium">
                        {event.event_invitations?.filter(
                          (inv) => inv.status === "pending"
                        ).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Declined
                      </span>
                      <span className="font-medium">
                        {event.event_invitations?.filter(
                          (inv) => inv.status === "declined"
                        ).length || 0}
                      </span>
                    </div>
                  </>
                )}

                {event.age_restriction && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Age Requirement
                    </span>
                    <span className="font-medium">
                      {event.age_restriction}+
                    </span>
                  </div>
                )}
              </div>

              {permissions.canViewAnalytics && (
                <button className="w-full mt-4 bg-brand-purple/10 text-brand-purple font-medium py-2 rounded-lg hover:bg-brand-purple/20 transition-colors flex items-center justify-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Detailed Analytics
                </button>
              )}
            </div>

            {/* Rest of sidebar components remain similar but with role-based enhancements */}
            {/* Quick Info, Guest List Preview, etc. */}
          </div>
        </div>
      </div>

      <div className="h-8"></div>
    </div>
  );
};

export default SingleEventPage;
