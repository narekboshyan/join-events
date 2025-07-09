import React from "react";
import { notFound } from "next/navigation";
import { EventResolver } from "@/lib/resolvers/event.resolver";
import { event_locations } from "@Prisma/index";

const Invitation = async ({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) => {
  const { invitationId } = await params;

  console.log("Fetching invitation with ID:", invitationId); // Debug log

  // Validate invitationId format (CUID should be 25 characters)
  if (!invitationId || invitationId.length < 20) {
    console.error("Invalid invitationId format:", invitationId);
    notFound();
  }

  try {
    // Fetch the invitation data using EventResolver
    const invitationData = await EventResolver.getInvitationData(invitationId);

    console.log({ invitationData });

    console.log("Invitation data fetched:", !!invitationData); // Debug log

    // If invitation not found, show 404
    if (!invitationData) {
      console.error("Invitation not found for ID:", invitationId);
      notFound();
    }

    // Extract data for easier use
    const { event, invited_user, inviter } = invitationData;
    const eventLocations = event.event_locations;
    const acceptedParticipants = event._count.event_invitations;

    // Format dates for display
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(date));
    };

    // Handle RSVP actions
    const handleRSVP = async (action: "accept" | "decline") => {
      "use server";

      try {
        const result = await EventResolver.handleRSVPResponse({
          invitationId,
          action,
          guestCount: 0, // You can make this dynamic
          // Add other optional fields as needed
        });

        console.log("RSVP result:", result);
        // You might want to redirect or show a success message
      } catch (error) {
        console.error("RSVP error:", error);
        // Handle error appropriately
      }
    };

    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Invitation Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">🎉 You're Invited!</h1>
          <h2 className="text-2xl font-light">{event.title}</h2>
          <p className="mt-4 opacity-90">
            {inviter.first_name} {inviter.last_name} has invited you to join
            this event
          </p>
        </div>

        {/* Invitation Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Invitation Status</h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  invitationData.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : invitationData.status === "declined"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {invitationData.status.charAt(0).toUpperCase() +
                  invitationData.status.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Invited as</p>
              <p className="font-medium capitalize">
                {invitationData.invitation_type.replace("_", " ")}
              </p>
            </div>
          </div>

          {invitationData.personal_message && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
              <p className="text-sm font-medium text-blue-800">
                Personal Message:
              </p>
              <p className="text-blue-700 italic">
                "{invitationData.personal_message}"
              </p>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">📅 Event Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Event Type</p>
              <p className="font-medium">
                {event.type} • {event.category || "General"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium capitalize">{event.status}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-medium">{formatDate(event.start_date)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">End Date</p>
              <p className="font-medium">{formatDate(event.end_date)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Participants</p>
              <p className="font-medium">
                {acceptedParticipants}
                {event.max_participants && `/${event.max_participants}`}{" "}
                confirmed
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Guest Allowance</p>
              <p className="font-medium">
                Up to {invitationData.max_guests} guest(s)
              </p>
            </div>
          </div>

          {event.description && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}

          {event.is_paid && event.price && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800">
                💰 This is a paid event: {event.price.toString()}{" "}
                {event.currency || "USD"} per person
              </p>
            </div>
          )}

          {event.age_restriction && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-800">
                🔞 Age Restriction: {event.age_restriction}
              </p>
            </div>
          )}

          {event.dress_code && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-800">
                👔 Dress Code: {event.dress_code}
              </p>
            </div>
          )}
        </div>

        {/* Event Locations */}
        {eventLocations.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">📍 Event Location(s)</h3>

            {eventLocations.map((location: event_locations, index: number) => (
              <div
                key={location.id}
                className="border border-gray-200 rounded-lg p-4 mb-4 last:mb-0"
              >
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{location.name}</h4>
                    {location.venue_type && (
                      <p className="text-sm text-gray-600 mb-2 capitalize">
                        ({location.venue_type})
                      </p>
                    )}

                    {location.address && (
                      <p className="text-gray-700 mb-2">
                        📍 {location.address}
                        {location.city && `, ${location.city}`}
                        {location.state && `, ${location.state}`}
                        {location.country && `, ${location.country}`}
                      </p>
                    )}

                    <div className="text-sm text-gray-600 mb-2">
                      <p>
                        ⏰ {formatDate(location.start_datetime)} -{" "}
                        {formatDate(location.end_datetime)}
                      </p>
                    </div>

                    {location.capacity && (
                      <p className="text-sm text-gray-600 mb-2">
                        👥 Capacity: {location.capacity} people
                      </p>
                    )}

                    {location.online_url && (
                      <div className="mt-2">
                        <a
                          href={location.online_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          🌐 Join Online ({location.online_platform || "Online"}
                          )
                        </a>
                        {location.meeting_id && (
                          <p className="text-xs text-gray-500 mt-1">
                            Meeting ID: {location.meeting_id}
                          </p>
                        )}
                        {location.access_code && (
                          <p className="text-xs text-gray-500">
                            Access Code: {location.access_code}
                          </p>
                        )}
                      </div>
                    )}

                    {location.special_instructions && (
                      <div className="mt-2 bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium text-gray-700">
                          Special Instructions:
                        </p>
                        <p className="text-sm text-gray-600">
                          {location.special_instructions}
                        </p>
                      </div>
                    )}

                    {location.parking_info && (
                      <div className="mt-2 bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-blue-700">
                          Parking Information:
                        </p>
                        <p className="text-sm text-blue-600">
                          {location.parking_info}
                        </p>
                      </div>
                    )}

                    {location.public_transport && (
                      <div className="mt-2 bg-green-50 p-3 rounded">
                        <p className="text-sm font-medium text-green-700">
                          Public Transport:
                        </p>
                        <p className="text-sm text-green-600">
                          {location.public_transport}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Event Creator */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">👤 Event Organizer</h3>
          <div className="flex items-center">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">
              {event.creator.first_name.charAt(0)}
              {event.creator.last_name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">
                {event.creator.first_name} {event.creator.last_name}
              </p>
              <p className="text-gray-600">@{event.creator.username}</p>
              <a
                href={`mailto:${event.creator.email}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {event.creator.email}
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {invitationData.status === "pending" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              🎯 Respond to Invitation
            </h3>
            <div className="flex gap-4">
              <form action={handleRSVP.bind(null, "accept")}>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ✅ Accept Invitation
                </button>
              </form>
              <form action={handleRSVP.bind(null, "decline")}>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ❌ Decline Invitation
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Already Responded */}
        {invitationData.status !== "pending" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">📋 Your Response</h3>
            <div
              className={`p-4 rounded-lg ${
                invitationData.status === "accepted"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`font-medium ${
                  invitationData.status === "accepted"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {invitationData.status === "accepted"
                  ? "✅ You have accepted this invitation"
                  : "❌ You have declined this invitation"}
              </p>
              {invitationData.response_date && (
                <p className="text-sm text-gray-600 mt-1">
                  Responded on: {formatDate(invitationData.response_date)}
                </p>
              )}
              {invitationData.status === "accepted" &&
                invitationData.guest_count > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Bringing {invitationData.guest_count} guest(s)
                  </p>
                )}
            </div>
          </div>
        )}

        {/* Debug Information (remove in production) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 rounded-lg p-4 mt-8">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(
                {
                  invitationId,
                  status: invitationData.status,
                  eventId: event.id,
                  invitedUserId: invited_user?.id,
                  inviterEmail: inviter.email,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching invitation:", error);

    // In development, show the error
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              Error Loading Invitation
            </h2>
            <p className="text-red-700 mb-4">
              Failed to load invitation with ID: {invitationId}
            </p>
            <pre className="text-xs text-red-600 bg-red-100 p-4 rounded overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </div>
        </div>
      );
    }

    // In production, show 404
    notFound();
  }
};

export default Invitation;
