"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Loader2, Search, UserPlus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserService } from "@/api/services/user.service";
import ConnectionCard from "@/components/ConnectionCard";
import UserCard from "@/components/UserCard";

const UsersPage = () => {
  const session = useSession();

  const currentUser = session.data?.user;

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

  const filteredConnections = useMemo(() => {
    if (!searchQuery) return connections;

    return connections.filter((connection: any) => {
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

  // const handleConnect = async (userId: string) => {
  //   try {
  //   } catch (error) {
  //     console.error("Error connecting:", error);
  //     alert("Failed to send connection request");
  //   }
  // };

  return (
    <div className="min-h-screen">
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

            <div className="flex flex-wrap gap-6 justify-center 2xl:justify-start ">
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
