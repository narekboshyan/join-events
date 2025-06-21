"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  Heart,
  MessageCircle,
  MoreVertical,
  Calendar,
  Star,
  Eye,
  Loader2,
} from "lucide-react";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  bio?: string;
  age?: number;
  city?: string;
  country?: string;
  is_verified: boolean;
  created_at: string;
  hobbies: Array<{
    hobby: {
      name: string;
      category: string;
    };
  }>;
  _count: {
    connections_initiated: number;
    connections_received: number;
    events_created: number;
  };
}

interface Connection {
  id: string;
  status: "pending" | "accepted" | "declined" | "blocked";
  connection_type: string;
  is_favorite: boolean;
  created_at: string;
  user: User;
  connected_user: User;
}

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState<"browse" | "connections">(
    "browse"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    age_range: "",
    hobbies: [] as string[],
    connection_type: "",
  });

  // Mock current user ID - replace with actual auth
  const currentUserId = "current-user-id";

  // Mock data - replace with actual API calls
  const mockUsers: User[] = [
    {
      id: "1",
      first_name: "Emily",
      last_name: "Chen",
      username: "emilyc",
      email: "emily@example.com",
      bio: "Love organizing events and meeting new people! Always up for a good adventure.",
      age: 28,
      city: "San Francisco",
      country: "USA",
      is_verified: true,
      created_at: "2024-01-15T00:00:00Z",
      hobbies: [
        { hobby: { name: "Photography", category: "arts" } },
        { hobby: { name: "Hiking", category: "outdoor" } },
      ],
      _count: {
        connections_initiated: 45,
        connections_received: 67,
        events_created: 12,
      },
    },
    {
      id: "2",
      first_name: "Marcus",
      last_name: "Johnson",
      username: "marcusj",
      email: "marcus@example.com",
      bio: "Tech enthusiast and party organizer. Let's create amazing experiences together!",
      age: 32,
      city: "Austin",
      country: "USA",
      is_verified: false,
      created_at: "2024-02-20T00:00:00Z",
      hobbies: [
        { hobby: { name: "Coding", category: "technology" } },
        { hobby: { name: "DJ", category: "music" } },
      ],
      _count: {
        connections_initiated: 23,
        connections_received: 31,
        events_created: 8,
      },
    },
    {
      id: "3",
      first_name: "Sofia",
      last_name: "Rodriguez",
      username: "sofiar",
      email: "sofia@example.com",
      bio: "Event planner by day, dancer by night. Love bringing people together!",
      age: 26,
      city: "Barcelona",
      country: "Spain",
      is_verified: true,
      created_at: "2024-03-10T00:00:00Z",
      hobbies: [
        { hobby: { name: "Dancing", category: "arts" } },
        { hobby: { name: "Cooking", category: "lifestyle" } },
      ],
      _count: {
        connections_initiated: 89,
        connections_received: 156,
        events_created: 24,
      },
    },
  ];

  const mockConnections: Connection[] = [
    {
      id: "1",
      status: "accepted",
      connection_type: "friend",
      is_favorite: true,
      created_at: "2024-01-20T00:00:00Z",
      user: mockUsers[0],
      connected_user: mockUsers[0],
    },
    {
      id: "2",
      status: "pending",
      connection_type: "professional",
      is_favorite: false,
      created_at: "2024-03-15T00:00:00Z",
      user: mockUsers[1],
      connected_user: mockUsers[1],
    },
  ];

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getConnectionStatus = (userId: string) => {
    // Mock connection status check
    if (userId === "1") return "connected";
    if (userId === "2") return "pending";
    return "none";
  };

  const handleConnect = async (userId: string) => {
    setIsLoading(true);
    try {
      // TODO: API call to send connection request
      console.log("Sending connection request to:", userId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error connecting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionAction = async (
    connectionId: string,
    action: "accept" | "decline"
  ) => {
    setIsLoading(true);
    try {
      // TODO: API call to handle connection action
      console.log(`${action} connection:`, connectionId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error handling connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const UserCard = ({ user }: { user: User }) => {
    const connectionStatus = getConnectionStatus(user.id);
    const userInitials =
      `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

    return (
      <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {user.first_name} {user.last_name}
                </h3>
                {user.is_verified && (
                  <div className="w-4 h-4 bg-brand-yellow rounded-full flex items-center justify-center">
                    <Star
                      className="w-2.5 h-2.5 text-brand-purple"
                      fill="currentColor"
                    />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
        {user.hobbies.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {user.hobbies.slice(0, 3).map((hobby, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-brand-yellow/10 text-brand-purple text-xs rounded-full"
                >
                  {hobby.hobby.name}
                </span>
              ))}
              {user.hobbies.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{user.hobbies.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>
            {user._count.connections_initiated +
              user._count.connections_received}{" "}
            connections
          </span>
          <span>{user._count.events_created} events</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {connectionStatus === "none" && (
            <button
              onClick={() => handleConnect(user.id)}
              disabled={isLoading}
              className="flex-1 bg-brand-purple text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-purple/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Connect
            </button>
          )}
          {connectionStatus === "pending" && (
            <button className="flex-1 bg-brand-yellow/10 text-brand-purple px-4 py-2 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
            </button>
          )}
          {connectionStatus === "connected" && (
            <button className="flex-1 bg-brand-green/10 text-brand-green px-4 py-2 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2">
              <UserCheck className="w-4 h-4" />
              Connected
            </button>
          )}
          <button className="bg-brand-pink/10 text-brand-pink px-4 py-2 rounded-lg hover:bg-brand-pink/20 transition-colors">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const ConnectionCard = ({ connection }: { connection: Connection }) => {
    const user =
      connection.user.id === currentUserId
        ? connection.connected_user
        : connection.user;
    const userInitials =
      `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

    return (
      <div className="bg-card rounded-xl p-6 shadow-sm border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {user.first_name} {user.last_name}
                </h3>
                {connection.is_favorite && (
                  <Heart className="w-4 h-4 text-brand-pink fill-current" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {connection.connection_type} • {connection.status}
              </p>
            </div>
          </div>
        </div>

        {connection.status === "pending" && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleConnectionAction(connection.id, "accept")}
              className="flex-1 bg-brand-purple text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-purple/90 transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => handleConnectionAction(connection.id, "decline")}
              className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <UserX className="w-4 h-4" />
              Decline
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button className="flex-1 bg-brand-yellow/10 text-brand-purple px-4 py-2 rounded-lg hover:bg-brand-yellow/20 transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          <button className="bg-brand-pink/10 text-brand-pink px-4 py-2 rounded-lg hover:bg-brand-pink/20 transition-colors">
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
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg max-w-md">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "browse"
                ? "bg-white text-brand-purple shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Search className="w-4 h-4" />
            Browse Users
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "connections"
                ? "bg-white text-brand-purple shadow-sm"
                : "text-gray-600 hover:text-gray-900"
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "browse"
                    ? "Search users by name, username, or location"
                    : "Search your connections"
                }
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg font-medium transition-colors flex items-center gap-2 ${
                showFilters ? "bg-brand-purple text-white" : "hover:bg-gray-50"
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
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
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
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
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
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
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
                    className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
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
                {filteredUsers.length} users found
              </p>
              <select className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple">
                <option>Sort by relevance</option>
                <option>Recently joined</option>
                <option>Most connections</option>
                <option>Most events</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                {mockConnections.length} connections
              </p>
              <div className="flex gap-2">
                <select className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple">
                  <option>All connections</option>
                  <option>Accepted</option>
                  <option>Pending</option>
                  <option>Favorites</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockConnections.map((connection) => (
                <ConnectionCard key={connection.id} connection={connection} />
              ))}
            </div>

            {mockConnections.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No connections yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start connecting with people to build your network
                </p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="bg-brand-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-purple/90 transition-colors"
                >
                  Browse Users
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
