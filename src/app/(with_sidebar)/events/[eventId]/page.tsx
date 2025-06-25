import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Share2,
  Star,
  Crown,
  PartyPopper,
  Globe,
  Lock,
  UserPlus,
  MoreHorizontal,
  DollarSign,
  Tag,
  Shield,
  User,
} from "lucide-react";
import { EventResolver } from "@/lib/resolvers/event.resolver";
import InviteUsersModal from "@/components/InviteUsersModal";
import { auth } from "@/lib/auth";

const SingleEventPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) => {
  const event = await EventResolver.getEventById((await params).eventId);
  const session = await auth();

  const currentUserId = session?.user.id; // Replace with actual current user ID

  // Determine user permissions
  const isCreator = event?.created_by === currentUserId;
  const userRole = event?.event_roles?.find(
    (role) => role.user_id === currentUserId
  );
  const canInviteUsers = isCreator || userRole?.can_invite_users || false;

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

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Join Event Card */}
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
                  {canInviteUsers && (
                    <InviteUsersModal
                      eventId={event.id}
                      isCreator={isCreator}
                      canInviteUsers={canInviteUsers}
                      currentUserId={currentUserId}
                      triggerButton={
                        <button className="bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-brand-pink/90 transition-colors flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          {isCreator ? "Invite & Assign" : "Invite Friends"}
                        </button>
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Event Management Card (Only for creators and admins) */}
            {(isCreator ||
              userRole?.role === "co_admin" ||
              userRole?.role === "organizer") && (
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
                      Manage your event settings and team
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <InviteUsersModal
                    eventId={event.id}
                    isCreator={isCreator}
                    canInviteUsers={canInviteUsers}
                    currentUserId={currentUserId}
                    triggerButton={
                      <button className="bg-brand-purple/10 text-brand-purple px-4 py-2 rounded-lg font-medium hover:bg-brand-purple/20 transition-colors flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Invite Team Members
                      </button>
                    }
                  />
                  <button className="bg-brand-yellow/10 text-brand-purple px-4 py-2 rounded-lg font-medium hover:bg-brand-yellow/20 transition-colors flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Manage Roles
                  </button>
                  {isCreator && (
                    <button className="bg-brand-orange/10 text-brand-purple px-4 py-2 rounded-lg font-medium hover:bg-brand-orange/20 transition-colors">
                      Edit Event
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Event Description */}
            {event.description && (
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Event Team (Show roles if user has permission) */}
            {(isCreator || userRole?.can_view_analytics) &&
              event.event_roles &&
              event.event_roles.length > 0 && (
                <div className="bg-card rounded-xl p-6 shadow-sm border">
                  <h2 className="text-xl font-semibold mb-4">Event Team</h2>
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
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

            {/* Venues */}
            {event.event_locations && event.event_locations.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Event Venues</h2>
                <div className="space-y-4">
                  {event.event_locations.map((location, index) => (
                    <div key={location.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MapPin
                          className={`w-5 h-5 mt-1 ${
                            index % 3 === 0
                              ? "text-brand-purple"
                              : index % 3 === 1
                              ? "text-brand-pink"
                              : "text-brand-orange"
                          }`}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{location.name}</h3>
                          {location.venue_type && (
                            <p className="text-sm text-muted-foreground mb-2 capitalize">
                              {location.venue_type} Venue
                            </p>
                          )}
                          {(location.address ||
                            location.city ||
                            location.state ||
                            location.country) && (
                            <p className="text-sm text-muted-foreground">
                              {[
                                location.address,
                                location.city,
                                location.state,
                                location.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                          {location.online_url && (
                            <p className="text-sm text-brand-purple mt-2">
                              Online:{" "}
                              {location.online_platform || "Virtual Event"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Event Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-brand-yellow/10 text-brand-purple px-3 py-1 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Event Rules & Info */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Event Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {event.age_restriction && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Age Restriction
                      </span>
                      <span className="font-medium">
                        {event.age_restriction}+
                      </span>
                    </div>
                  )}
                  {event.dress_code && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Dress Code
                      </span>
                      <span className="font-medium capitalize">
                        {event.dress_code}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Guests Allowed
                    </span>
                    <span className="font-medium">
                      {event.allow_guests ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {event.max_participants && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Max Participants
                      </span>
                      <span className="font-medium">
                        {event.max_participants}
                      </span>
                    </div>
                  )}
                  {event.min_participants && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Min Participants
                      </span>
                      <span className="font-medium">
                        {event.min_participants}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Auto Approve
                    </span>
                    <span className="font-medium">
                      {event.auto_approve ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Feedback Section - Placeholder for future implementation */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Event Reviews</h2>
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to attend and leave feedback!
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Information */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">Hosted by</h3>
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
                    Event Organizer
                  </p>
                  {event.creator?.username && (
                    <p className="text-xs text-muted-foreground">
                      @{event.creator.username}
                    </p>
                  )}
                </div>
              </div>
              <button className="w-full bg-brand-yellow text-brand-purple font-medium py-2 rounded-lg hover:bg-brand-yellow/90 transition-colors">
                Message Host
              </button>
            </div>

            {/* Event Stats */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">Event Stats</h3>
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
            </div>

            {/* Quick Info */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-brand-purple" />
                  <div>
                    <p className="text-sm font-medium">{formattedDate}</p>
                    <p className="text-xs text-muted-foreground">
                      {formattedStartTime} - {formattedEndTime}
                    </p>
                  </div>
                </div>
                {event.event_locations && event.event_locations.length > 0 && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-brand-pink" />
                    <div>
                      <p className="text-sm font-medium">
                        {event.event_locations[0].name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.event_locations[0].city || "Location TBD"}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-brand-orange" />
                  <div>
                    <p className="text-sm font-medium">
                      {event.is_public ? "Public Event" : "Private Event"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.is_public ? "Everyone welcome" : "Invitation only"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest List Preview */}
            {event.event_invitations && event.event_invitations.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Who's Going</h3>
                  <button className="text-brand-purple text-sm font-medium">
                    See All
                  </button>
                </div>
                <div className="flex -space-x-2 mb-3">
                  {event.event_invitations
                    .filter((inv) => inv.status === "accepted")
                    .slice(0, 5)
                    .map((invitation, index) => {
                      const initials = invitation.invited_user
                        ? `${invitation.invited_user.first_name?.[0] || ""}${
                            invitation.invited_user.last_name?.[0] || ""
                          }`.toUpperCase()
                        : "U";
                      return (
                        <div
                          key={invitation.id}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white ${
                            index % 2 === 0
                              ? "bg-brand-purple"
                              : "bg-brand-pink"
                          }`}
                          title={
                            invitation.invited_user
                              ? `${invitation.invited_user.first_name || ""} ${
                                  invitation.invited_user.last_name || ""
                                }`.trim()
                              : "Guest"
                          }
                        >
                          {initials}
                        </div>
                      );
                    })}
                  {acceptedCount > 5 && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                      +{acceptedCount - 5}
                    </div>
                  )}
                </div>

                {/* Different invite button text based on permissions */}
                <InviteUsersModal
                  eventId={event.id}
                  isCreator={isCreator}
                  canInviteUsers={canInviteUsers}
                  currentUserId={currentUserId}
                  triggerButton={
                    <button className="w-full bg-brand-pink/10 text-brand-pink font-medium py-2 rounded-lg hover:bg-brand-pink/20 transition-colors flex items-center justify-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      {isCreator
                        ? "Invite & Manage"
                        : canInviteUsers
                        ? "Invite Friends"
                        : "Suggest Friends"}
                    </button>
                  }
                />
              </div>
            )}

            {/* Show invite button even if no current invitations */}
            {(!event.event_invitations ||
              event.event_invitations.length === 0) &&
              canInviteUsers && (
                <div className="bg-card rounded-xl p-6 shadow-sm border">
                  <div className="text-center py-4">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No one has been invited yet
                    </p>
                    <InviteUsersModal
                      eventId={event.id}
                      isCreator={isCreator}
                      canInviteUsers={canInviteUsers}
                      currentUserId={currentUserId}
                      triggerButton={
                        <button className="w-full bg-brand-purple text-white font-medium py-2 rounded-lg hover:bg-brand-purple/90 transition-colors flex items-center justify-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          {isCreator
                            ? "Invite First Members"
                            : "Invite Friends"}
                        </button>
                      }
                    />
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="h-8"></div>
    </div>
  );
};

export default SingleEventPage;
