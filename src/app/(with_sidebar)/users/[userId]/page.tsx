"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Share2,
  Users,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { UserService } from "@/api/services/user.service";

// const mockHobbies = [
//   {
//     name: "Photography",
//     category: "arts",
//     skill_level: "advanced",
//     years_experience: 5,
//     is_favorite: true,
//   },
//   {
//     name: "Hiking",
//     category: "outdoor",
//     skill_level: "expert",
//     years_experience: 10,
//     is_favorite: true,
//   },
//   {
//     name: "Cooking",
//     category: "lifestyle",
//     skill_level: "intermediate",
//     years_experience: 3,
//     is_favorite: false,
//   },
//   {
//     name: "Guitar",
//     category: "music",
//     skill_level: "beginner",
//     years_experience: 1,
//     is_favorite: false,
//   },
// ];

// const mockActivities = [
//   {
//     name: "Rock Climbing",
//     category: "outdoor",
//     frequency: "weekly",
//     preference_level: 9,
//     is_favorite: true,
//   },
//   {
//     name: "Board Games",
//     category: "indoor",
//     frequency: "monthly",
//     preference_level: 7,
//     is_favorite: false,
//   },
//   {
//     name: "Yoga",
//     category: "fitness",
//     frequency: "daily",
//     preference_level: 8,
//     is_favorite: true,
//   },
// ];

// const mockEntertainments = [
//   {
//     name: "Indie Rock",
//     category: "music",
//     preference_level: 9,
//     is_favorite: true,
//   },
//   {
//     name: "Sci-Fi Movies",
//     category: "movies",
//     preference_level: 8,
//     is_favorite: true,
//   },
//   {
//     name: "Strategy Games",
//     category: "games",
//     preference_level: 7,
//     is_favorite: false,
//   },
// ];

// const mockConnections = [
//   {
//     name: "Sarah Johnson",
//     status: "accepted",
//     connection_type: "friend",
//     last_interaction: "2024-12-20",
//   },
//   {
//     name: "Mike Chen",
//     status: "accepted",
//     connection_type: "colleague",
//     last_interaction: "2024-12-18",
//   },
//   {
//     name: "Emma Davis",
//     status: "pending",
//     connection_type: "friend",
//     last_interaction: null,
//   },
// ];

// const mockEvents = [
//   {
//     title: "Weekend Photography Walk",
//     type: "offline",
//     status: "published",
//     category: "hobby",
//     start_date: "2024-12-28",
//     participants: 15,
//     role: "creator",
//   },
//   {
//     title: "Tech Meetup Downtown",
//     type: "offline",
//     status: "published",
//     category: "professional",
//     start_date: "2025-01-05",
//     participants: 32,
//     role: "participant",
//   },
// ];

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const params = useParams();

  const { data: user } = useQuery({
    queryKey: ["user", params.userId],
    queryFn: () => UserService.getUserById(params.userId as string),
    enabled: !!params.userId,
  });

  console.log(user, "==========");

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "advanced":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "intermediate":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "beginner":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // const getFrequencyColor = (frequency: string) => {
  //   switch (frequency) {
  //     case "daily":
  //       return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  //     case "weekly":
  //       return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  //     case "monthly":
  //       return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  //     case "occasionally":
  //       return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  //     default:
  //       return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  //   }
  // };

  const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className={`p-1.5 sm:p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900 flex-shrink-0`}
        >
          <Icon
            className={`w-4 h-4 sm:w-5 sm:h-5 text-${color}-600 dark:text-${color}-400`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
            {label}
          </p>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-3 py-2 font-medium text-xs sm:text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
        isActive
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "hobbies", label: "Hobbies" },
    { id: "activities", label: "Activities" },
    { id: "entertainment", label: "Entertainment" },
    { id: "connections", label: "Connections" },
    { id: "events", label: "Events" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-4 sm:mb-8">
          {/* Cover Photo */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col space-y-4 -mt-12 sm:-mt-16 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="relative self-start">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800 flex items-center justify-center text-2xl sm:text-4xl font-bold text-gray-600 dark:text-gray-300">
                      {user?.first_name[0]}
                      {user?.last_name[0]}
                    </div>
                    {user?.is_verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-blue-500 rounded-full p-1">
                        <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name and Basic Info */}
                  <div className="pb-2 sm:pb-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                        {user?.first_name} {user?.last_name}
                      </h1>
                    </div>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-2 truncate">
                      @{user?.username}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {user?.country}, {user?.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>Age {user?.age}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          Joined{" "}
                          {new Date(user?.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row sm:flex-row gap-2 mt-4 sm:mt-0">
                  <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                  <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Connect</span>
                  </button>
                  <button className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bio */}
            {user?.bio && (
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 max-w-4xl leading-relaxed">
                {user?.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <StatCard
                icon={Eye}
                label="Profile Views"
                value={user?.profile_visits_received.length}
                color="purple"
              />
              <StatCard
                icon={Users}
                label="Connections"
                value={0} //not set yet
                color="blue"
              />
              <StatCard
                icon={Calendar}
                label="Events Created"
                value={user?.events_created.length}
                color="green"
              />
              <StatCard
                icon={Activity}
                label="Events Attended"
                value={0} //not set yet
                color="orange"
              />
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6">
            <div className="flex overflow-x-auto gap-1 sm:gap-2 py-3 sm:py-4 scrollbar-hide">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  isActive={activeTab === tab.id}
                  onClick={setActiveTab}
                />
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-6">
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Email
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Phone
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          {user?.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Account Status
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          user?.is_active ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                        {user?.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {user?.is_verified ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                        {user?.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:col-span-2 lg:col-span-1">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          user?.profile_completed
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                        Profile{" "}
                        {user?.profile_completed ? "Complete" : "Incomplete"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* {activeTab === "hobbies" && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Hobbies & Interests
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {mockHobbies.map((hobby, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {hobby.name}
                          </h4>
                          {hobby.is_favorite && (
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${getSkillLevelColor(
                            hobby.skill_level
                          )}`}
                        >
                          {hobby.skill_level}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                        {hobby.category}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {hobby.years_experience}{" "}
                        {hobby.years_experience === 1 ? "year" : "years"}{" "}
                        experience
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* {activeTab === "activities" && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Activities
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {mockActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {activity.name}
                          </h4>
                          {activity.is_favorite && (
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${getFrequencyColor(
                            activity.frequency
                          )}`}
                        >
                          {activity.frequency}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                        {activity.category}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                          Preference:
                        </span>
                        <div className="flex gap-1 flex-1 min-w-0">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                                i < activity.preference_level
                                  ? "bg-blue-500"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white flex-shrink-0">
                          {activity.preference_level}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* {activeTab === "entertainment" && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Entertainment Preferences
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {mockEntertainments.map((entertainment, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {entertainment.name}
                          </h4>
                          {entertainment.is_favorite && (
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          {entertainment.category === "music" && (
                            <Music className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          )}
                          {entertainment.category === "games" && (
                            <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          )}
                          {entertainment.category === "movies" && (
                            <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                        {entertainment.category}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                          Rating:
                        </span>
                        <div className="flex gap-1 flex-1 min-w-0">
                          {[...Array(10)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0 ${
                                i < entertainment.preference_level
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white flex-shrink-0">
                          {entertainment.preference_level}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* {activeTab === "connections" && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Connections
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {mockConnections.map((connection, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm sm:text-lg font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                          {connection.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {connection.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {connection.connection_type}
                          </p>
                          {connection.last_interaction && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                              Last interaction:{" "}
                              {new Date(
                                connection.last_interaction
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            connection.status === "accepted"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : connection.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {connection.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* {activeTab === "events" && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Events
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {mockEvents.map((event, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                            {event.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {event.category} • {event.type}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap self-start ${
                            event.role === "creator"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {event.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {new Date(event.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {event.participants} participants
                          </span>
                        </div>
                        <div
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            event.status === "published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {event.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
