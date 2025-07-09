import { AllUsersType } from "@/types/user";
import {
  Calendar,
  MapPin,
  MessageCircle,
  Star,
  Eye,
  Users,
  Phone,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UserCardProps {
  user: AllUsersType[number];
  mutualConnections?: number;
}

const UserCard = ({ user, mutualConnections = 0 }: UserCardProps) => {
  const userInitials =
    `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

  const router = useRouter();

  return (
    <div className="max-w-[398px] w-[398px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Hero Section with Avatar */}
      <div className="relative h-36 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-6">
        {/* Large Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold text-2xl shadow-lg ring-4 ring-white/20">
              {userInitials}
            </div>
            {user.is_verified && (
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                <Star className="w-4 h-4 text-white" fill="currentColor" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* User Name */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {user.first_name} {user.last_name}
        </h2>

        {/* Key Information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm">@{user.username}</span>
          </div>

          {user.age && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{user.age} years old</span>
            </div>
          )}

          {(user.city || user.country) && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {[user.city, user.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {user.phone && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
              {user.bio}
            </p>
          </div>
        )}

        {/* Mutual Connections */}
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 mb-4">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm">
            {mutualConnections} mutual connections
          </span>
        </div>

        {/* Hobbies Tags */}
        {user.user_hobbies.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {user.user_hobbies.slice(0, 4).map((userHobby, index) => (
                <span
                  key={index}
                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700"
                >
                  {userHobby.hobby.name}
                </span>
              ))}
              {user.user_hobbies.length > 4 && (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-600">
                  +{user.user_hobbies.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-col md:flex-row">
          <button
            onClick={() => router.push(`users/${user.id}`)}
            className="cursor-pointer flex-1 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>

          <button
            onClick={() => {}}
            className="cursor-pointer flex-1 bg-gray-600 dark:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-800 px-4 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
