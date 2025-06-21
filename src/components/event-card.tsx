"use client";

import Image from "next/image";
import { Calendar, MapPin, Users, Tag, Clock, Globe, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventImage from "@/public/dua.webp";
import { AllEventType } from "@/types/event";

interface EventCardProps {
  event: AllEventType[number];
  onActionClick: (eventId: string, action: "view" | "join" | "leave") => void;
  currentUserId?: string; // To determine if user can join/leave
  userInvitationStatus?: "pending" | "accepted" | "declined" | null;
}

export function EventCard({
  event,
  onActionClick,
  currentUserId,
  userInvitationStatus,
}: Readonly<EventCardProps>) {
  const coverImage = event.event_attachments.find(
    (att) => att.attachment_type === "cover_image" || att.is_featured
  );

  // Format date and time
  const formatDateTime = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const startDateTime = formatDateTime(event.start_date);
  const endDateTime = formatDateTime(event.end_date);

  // Get primary location
  const primaryLocation =
    event.event_locations.find((loc) => loc.venue_type === "primary") ||
    event.event_locations[0];

  // Format location display
  const getLocationDisplay = () => {
    if (event.type === "online") {
      return "Online Event";
    }

    if (primaryLocation) {
      const parts = [];
      if (primaryLocation.city) parts.push(primaryLocation.city);
      if (primaryLocation.state) parts.push(primaryLocation.state);
      if (primaryLocation.country) parts.push(primaryLocation.country);
      return parts.join(", ") || primaryLocation.name;
    }

    return "Location TBD";
  };

  // Determine if user is participating
  const isParticipating = userInvitationStatus === "accepted";
  const isPending = userInvitationStatus === "pending";
  const isCreator = currentUserId === event.created_by;

  return (
    <Card className="flex flex-col h-full">
      {/* Event Image */}
      <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
        <Image
          src={coverImage?.attachment.file_url || EventImage}
          alt={coverImage?.attachment.alt_text || event.title}
          fill
          className="object-cover rounded-t-lg"
        />

        {/* Status and Type Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="secondary" className="capitalize text-xs">
            {event.type}
          </Badge>
          {event.status !== "published" && (
            <Badge
              variant="outline"
              className="capitalize text-xs bg-background/80"
            >
              {event.status}
            </Badge>
          )}
        </div>

        {/* Privacy Badge */}
        <div className="absolute top-2 left-2">
          {event.is_public ? (
            <Badge variant="secondary" className="text-xs bg-background/80">
              <Globe className="h-3 w-3 mr-1" />
              Public
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-background/80">
              <Lock className="h-3 w-3 mr-1" />
              Private
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {event.title}
        </CardTitle>

        {/* Start Date & Time */}
        <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {startDateTime.date} at {startDateTime.time}
        </CardDescription>

        {/* End Date & Time (if different day) */}
        {new Date(event.start_date).toDateString() !==
          new Date(event.end_date).toDateString() && (
          <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Ends: {endDateTime.date} at {endDateTime.time}
          </CardDescription>
        )}

        {/* Location */}
        <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {getLocationDisplay()}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow pt-2">
        {/* Description */}
        {event.description && (
          <p className="text-sm text-foreground line-clamp-3 mb-3">
            {event.description}
          </p>
        )}

        {/* Participants Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Users className="h-4 w-4" />
          <span>
            {event._count.event_invitations} accepted
            {event.max_participants && ` / ${event.max_participants} max`}
          </span>
        </div>

        {/* Category and Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {event.category && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <Tag className="h-3 w-3" />
              {event.category}
            </Badge>
          )}

          {event.age_restriction && (
            <Badge variant="outline" className="text-xs">
              {event.age_restriction}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {event.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 2} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => onActionClick(event.id, "view")}
          size="sm"
        >
          View Details
        </Button>

        <div className="flex gap-2">
          {isCreator ? (
            <Badge variant="secondary" className="px-3 py-1">
              Creator
            </Badge>
          ) : (
            <>
              {isPending ? (
                <Badge variant="outline" className="px-3 py-1">
                  Pending
                </Badge>
              ) : isParticipating ? (
                <Button
                  variant="outline"
                  onClick={() => onActionClick(event.id, "leave")}
                  size="sm"
                >
                  Leave Event
                </Button>
              ) : (
                <Button
                  onClick={() => onActionClick(event.id, "join")}
                  size="sm"
                  disabled={event.status !== "published"}
                >
                  Join Event
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
