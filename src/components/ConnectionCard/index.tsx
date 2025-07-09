"use client";
import { UserService } from "@/api/services/user.service";
import { AllUserConnectionsType } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Heart, MessageCircle, UserCheck, UserX } from "lucide-react";
import { useSession } from "next-auth/react";

const ConnectionCard = ({
  connection,
}: {
  connection: AllUserConnectionsType[number];
}) => {
  const session = useSession();
  const queryClient = useQueryClient();
  const currentUser = session.data?.user;

  //   const sendConnectionMutation = useMutation({
  //     mutationFn: ({
  //       targetUserId,
  //       connectionType,
  //       notes,
  //     }: {
  //       targetUserId: string;
  //       connectionType?: string;
  //       notes?: string;
  //     }) =>
  //       UserService.sendConnectionRequest(targetUserId, connectionType, notes),
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ["connectionStatuses"] });
  //       queryClient.invalidateQueries({ queryKey: ["connections"] });
  //     },
  //   });

  const acceptConnectionMutation = useMutation({
    mutationFn: (connectionId: string) =>
      UserService.acceptConnectionRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connectionStatuses"] });
    },
  });

  const declineConnectionMutation = useMutation({
    mutationFn: (connectionId: string) =>
      UserService.declineConnectionRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connectionStatuses"] });
    },
  });

  const handleConnectionAction = async (
    connectionId: string,
    action: "accept" | "decline"
  ) => {
    try {
      if (action === "accept") {
        await acceptConnectionMutation.mutateAsync(connectionId);
      } else {
        await declineConnectionMutation.mutateAsync(connectionId);
      }
    } catch (error) {
      console.error("Error handling connection:", error);
      alert(`Failed to ${action} connection`);
    }
  };

  const user =
    connection.user_id === currentUser.id
      ? connection.receiver
      : connection.initiator;
  const userInitials =
    `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  const isPendingReceived =
    connection.status === "pending" &&
    connection.connected_id === currentUser.id;

  if (!currentUser) return null;

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border ">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
            {userInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {user.first_name} {user.last_name}
              </h3>
              {connection.is_favorite && (
                <Heart className="w-4 h-4 text-destructive fill-current" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {connection.connection_type} • {connection.status}
            </p>
          </div>
        </div>
      </div>

      {isPendingReceived && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleConnectionAction(connection.id, "accept")}
            disabled={acceptConnectionMutation.isPending}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={() => handleConnectionAction(connection.id, "decline")}
            disabled={declineConnectionMutation.isPending}
            className="flex-1 bg-muted text-muted-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
          >
            <UserX className="w-4 h-4" />
            Decline
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button className="flex-1 bg-accent/20 text-primary px-4 py-2 rounded-lg hover:bg-accent/30 transition-colors flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Message
        </button>
        <button className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg hover:bg-destructive/20 transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ConnectionCard;
