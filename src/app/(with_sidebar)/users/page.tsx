"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  MapPin,
  Heart,
  MessageCircle,
  MoreVertical,
  Calendar,
  Star,
  Eye,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/api/services/user.service";
import { AllUserConnectionsType, AllUsersType } from "@/types/user";
import { useSession } from "next-auth/react";

const UsersPage = () => {
  const session = useSession();

  const currentUser = session.data?.user;

  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"browse" | "connections">(
    "browse"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    age_range: "",
    hobbies: [] as string[],
    connection_type: "",
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: UserService.getAllUsers,
  });

  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: UserService.getAllMyConnections,
    enabled: activeTab === "connections",
  });

  // const { data: connectionStatuses = {} } = useQuery({
  //   queryKey: ["connectionStatuses"],
  //   queryFn: UserService.getAllMyConnections,
  //   enabled: activeTab === "browse",
  // });

  const sendConnectionMutation = useMutation({
    mutationFn: ({
      targetUserId,
      connectionType,
      notes,
    }: {
      targetUserId: string;
      connectionType?: string;
      notes?: string;
    }) =>
      UserService.sendConnectionRequest(targetUserId, connectionType, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });

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

  const filteredConnections = useMemo(() => {
    if (!searchQuery) return connections;

    return connections.filter((connection) => {
      const otherUser =
        connection.user_id === currentUser?.id
          ? connection.receiver
          : connection.initiator;
      return (
        otherUser.first_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        otherUser.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [connections, searchQuery, currentUser?.id]);

  const handleConnect = async (userId: string) => {
    try {
    } catch (error) {
      console.error("Error connecting:", error);
      alert("Failed to send connection request");
    }
  };

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

  const UserCard = ({ user }: { user: AllUsersType[number] }) => {
    const userInitials =
      `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

    return (
      <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
        {/* Header */}
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
                {user.is_verified && (
                  <div className="w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                    <Star
                      className="w-2.5 h-2.5 text-primary"
                      fill="currentColor"
                    />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Info */}
        <div className="space-y-2 mb-4">
          {(user.city || user.country) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                {[user.city, user.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {user.age && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{user.age} years old</span>
            </div>
          )}
        </div>

        {/* Hobbies */}
        {user.user_hobbies.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {user.user_hobbies.slice(0, 3).map((userHobby, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-accent/20 text-primary text-xs rounded-full"
                >
                  {userHobby.hobby.name}
                </span>
              ))}
              {user.user_hobbies.length > 3 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  +{user.user_hobbies.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>
            {/* {user._count.connections_initiated +
              user._count.connections_received}{" "} */}
            connections
          </span>
          {/* <span>{user._count.events_created} events</span> */}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* {"connectionStatus" === "none" && (
            <button
              onClick={() => handleConnect(user.id)}
              disabled={sendConnectionMutation.isPending}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sendConnectionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Connect
            </button>
          )}
          {"connectionStatus" === "pending" && (
            <button className="flex-1 bg-accent/20 text-primary px-4 py-2 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
            </button>
          )}
          {"connectionStatus" === "accepted" && (
            <button className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2">
              <UserCheck className="w-4 h-4" />
              Connected
            </button>
          )} */}
          <button className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg hover:bg-destructive/20 transition-colors">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const ConnectionCard = ({
    connection,
  }: {
    connection: AllUserConnectionsType[number];
  }) => {
    if (!currentUser) return null;

    const user =
      connection.user_id === currentUser.id
        ? connection.receiver
        : connection.initiator;
    const userInitials =
      `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    const isPendingReceived =
      connection.status === "pending" &&
      connection.connected_id === currentUser.id;

    return (
      <div className="bg-card rounded-xl p-6 shadow-sm border">
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connect with People</h1>
          <p className="text-muted-foreground">
            Discover amazing people and build your network
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg max-w-md">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "browse"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="w-4 h-4" />
            Browse Users
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "connections"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            My Connections
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "browse"
                    ? "Search users by name, username, or location"
                    : "Search your connections"
                }
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border border-input rounded-lg font-medium transition-colors flex items-center gap-2 ${
                showFilters
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-card rounded-lg p-4 border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Age Range
                  </label>
                  <select
                    value={filters.age_range}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        age_range: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  >
                    <option value="">Any age</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46+">46+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Connection Type
                  </label>
                  <select
                    value={filters.connection_type}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        connection_type: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  >
                    <option value="">All types</option>
                    <option value="friend">Friends</option>
                    <option value="professional">Professional</option>
                    <option value="colleague">Colleagues</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() =>
                      setFilters({
                        location: "",
                        age_range: "",
                        hobbies: [],
                        connection_type: "",
                      })
                    }
                    className="w-full px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === "browse" ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {users.length} users found
              </p>
              <select className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                <option>Sort by relevance</option>
                <option>Recently joined</option>
                <option>Most connections</option>
                <option>Most events</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {filteredConnections.length} connections
              </p>
              <select className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                <option>All connections</option>
                <option>Accepted</option>
                <option>Pending</option>
                <option>Favorites</option>
              </select>
            </div>

            {connectionsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredConnections.map((connection) => (
                    <ConnectionCard
                      key={connection.id}
                      connection={connection}
                    />
                  ))}
                </div>

                {filteredConnections.length === 0 && (
                  <div className="text-center py-12">
                    <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No connections yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start connecting with people to build your network
                    </p>
                    <button
                      onClick={() => setActiveTab("browse")}
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Browse Users
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
