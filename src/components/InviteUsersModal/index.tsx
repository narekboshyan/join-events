"use client";
import React, { useState, useRef, KeyboardEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserPlus,
  Mail,
  Users,
  Crown,
  Shield,
  User,
  Search,
  X,
  Send,
  Plus,
  ChevronDown,
  Check,
  AlertCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { InviteFormData, inviteFormSchema } from "@/lib/validations/event";
import { useMutation } from "@tanstack/react-query";
import { EventService } from "@/api/services/event.service";
import { useParams } from "next/navigation";

interface InviteUsersModalProps {
  eventId: string;
  isCreator: boolean;
  canInviteUsers: boolean;
  currentUserId: string;
  triggerButton: React.ReactNode;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

// Zod validation schema

const InviteUsersModal: React.FC<InviteUsersModalProps> = ({
  eventId,
  isCreator,
  canInviteUsers,
  currentUserId,
  triggerButton,
}) => {
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "search">("email");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      emails: [],
      selectedUsers: [],
      role: "participant",
      personalMessage: "",
      maxGuests: 0,
      currentEmail: "",
    },
    mode: "onChange",
  });

  console.log({ errors });

  const watchedEmails = watch("emails");
  const watchedSelectedUsers = watch("selectedUsers") || [];
  const watchedCurrentEmail = watch("currentEmail");
  const watchedRole = watch("role");

  const { mutate: inviteUsers } = useMutation({
    mutationFn: EventService.sendBulkEventInvitations.bind(
      null,
      params.eventId as string
    ),
  });

  // Available roles based on user permissions
  const getAvailableRoles = () => {
    if (isCreator) {
      return [
        {
          value: "participant",
          label: "Participant",
          icon: User,
          description: "Can attend the event",
        },
        {
          value: "organizer",
          label: "Organizer",
          icon: Users,
          description: "Can help organize and manage event",
        },
        {
          value: "moderator",
          label: "Moderator",
          icon: Shield,
          description: "Can moderate discussions and manage participants",
        },
        {
          value: "co_admin",
          label: "Co-Admin",
          icon: Crown,
          description: "Full admin rights except deleting event",
        },
      ];
    } else {
      return [
        {
          value: "participant",
          label: "Participant",
          icon: User,
          description: "Can attend the event",
        },
      ];
    }
  };

  const roles = getAvailableRoles();

  // Add email to list
  const addEmailToList = () => {
    const currentEmail = watchedCurrentEmail?.trim();
    if (!currentEmail) return;

    if (watchedEmails.includes(currentEmail)) {
      setError("currentEmail", {
        type: "manual",
        message: "This email is already in the list",
      });
      return;
    }

    // Add email to the list
    setValue("emails", [...watchedEmails, currentEmail]);
    setValue("currentEmail", "");
    clearErrors("currentEmail");

    // Clear any previous emails validation errors
    clearErrors("emails");

    // Focus back to the input
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 50);
  };

  // Remove email from list
  const removeEmail = (emailToRemove: string) => {
    const updatedEmails = watchedEmails.filter(
      (email) => email !== emailToRemove
    );
    setValue("emails", updatedEmails);

    // Clear errors if list becomes empty
    if (updatedEmails.length === 0) {
      clearErrors("emails");
    }
  };

  // Handle Enter key for email input
  const handleEmailKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmailToList();
    }
  };

  // Search users (replace with actual API call)
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      // const users = await response.json();

      // Mock search results for demo
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockResults: User[] = [
        {
          id: "1",
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          username: "johndoe",
        },
        {
          id: "2",
          first_name: "Jane",
          last_name: "Smith",
          email: "jane@example.com",
          username: "janesmith",
        },
        {
          id: "3",
          first_name: "Mike",
          last_name: "Johnson",
          email: "mike@example.com",
          username: "mikej",
        },
        {
          id: "4",
          first_name: "Sarah",
          last_name: "Williams",
          email: "sarah@example.com",
          username: "sarahw",
        },
        {
          id: "5",
          first_name: "Alex",
          last_name: "Brown",
          email: "alex@example.com",
          username: "alexb",
        },
      ];

      const filtered = mockResults.filter(
        (user) =>
          user.first_name.toLowerCase().includes(query.toLowerCase()) ||
          user.last_name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (user: User) => {
    const isSelected = watchedSelectedUsers.find((u) => u.id === user.id);
    if (isSelected) {
      setValue(
        "selectedUsers",
        watchedSelectedUsers.filter((u) => u.id !== user.id)
      );
    } else {
      setValue("selectedUsers", [...watchedSelectedUsers, user]);
    }
    clearErrors("selectedUsers");
  };

  // Form submission handler
  const onSubmit = (data: InviteFormData) => {
    if (!canInviteUsers) return;

    try {
      const inviteData = {
        eventId,
        emails:
          activeTab === "email"
            ? data.emails
            : data.selectedUsers?.map((u) => u.email) || [],
        users: activeTab === "search" ? data.selectedUsers : undefined,
        role: data.role,
        personalMessage: data.personalMessage || "",
        maxGuests: data.maxGuests,
        invitedBy: currentUserId,
        invitationType: isCreator ? "admin" : "participant",
      };

      inviteUsers(inviteData);

      handleClose();

      alert(
        `Successfully sent ${
          activeTab === "email"
            ? data.emails.length
            : data.selectedUsers?.length || 0
        } invitation(s)!`
      );
    } catch (error) {
      console.error("Error sending invitations:", error);
      alert("Failed to send invitations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid for current tab
  const isFormValid = () => {
    if (activeTab === "email") {
      return watchedEmails.length > 0 && !errors.emails;
    } else {
      return watchedSelectedUsers.length > 0 && !errors.selectedUsers;
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setIsOpen(false);
    reset();
    setSearchQuery("");
    setSearchResults([]);
    setShowRoleSelector(false);
  };

  // Handle tab change
  const handleTabChange = (tab: "email" | "search") => {
    setActiveTab(tab);
    // Clear errors for the current validation
    clearErrors();
  };

  if (!canInviteUsers) {
    return null; // Don't render if user can't invite
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {triggerButton}
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-brand-purple/5 to-brand-pink/5">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-purple" />
                  {isCreator ? "Invite & Assign Roles" : "Invite Friends"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isCreator
                    ? "Invite users and assign them roles in your event"
                    : "Invite your friends to join this event together"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleTabChange("email")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeTab === "email"
                        ? "bg-white text-brand-purple shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    By Email
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("search")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeTab === "search"
                        ? "bg-white text-brand-purple shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Search Users
                  </button>
                </div>

                {/* Email Tab */}
                {activeTab === "email" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email Addresses *
                      </label>
                      <div className="flex gap-2">
                        <Controller
                          name="currentEmail"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              ref={emailInputRef}
                              type="email"
                              onKeyPress={handleEmailKeyPress}
                              placeholder="Enter email address and press Enter"
                              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent ${
                                errors.currentEmail ? "border-red-500" : ""
                              }`}
                            />
                          )}
                        />
                        <button
                          type="button"
                          onClick={addEmailToList}
                          disabled={!watchedCurrentEmail?.trim()}
                          className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Email validation feedback */}
                      {errors.currentEmail && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.currentEmail.message}
                        </p>
                      )}

                      {/* Email List */}
                      {watchedEmails.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium">
                            Email List ({watchedEmails.length})
                          </p>
                          <div className="max-h-32 overflow-y-auto space-y-2">
                            {watchedEmails.map((email, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                              >
                                <span className="text-sm">{email}</span>
                                <button
                                  type="button"
                                  onClick={() => removeEmail(email)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Emails validation error */}
                      {errors.emails && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.emails.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Search Tab */}
                {activeTab === "search" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Search Users *
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            searchUsers(e.target.value);
                          }}
                          placeholder="Search by name, email, or username"
                          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Search Results */}
                    {searchQuery && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.length > 0
                          ? searchResults.map((user) => {
                              const isSelected = watchedSelectedUsers.find(
                                (u) => u.id === user.id
                              );
                              return (
                                <div
                                  key={user.id}
                                  onClick={() => toggleUserSelection(user)}
                                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                    isSelected
                                      ? "bg-brand-purple/10 border border-brand-purple"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-brand-purple rounded-full flex items-center justify-center text-white text-sm font-medium">
                                      {user.first_name[0]}
                                      {user.last_name[0]}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {user.first_name} {user.last_name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        @{user.username} • {user.email}
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-brand-purple" />
                                  )}
                                </div>
                              );
                            })
                          : !isSearching && (
                              <div className="text-center py-4 text-muted-foreground">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No users found</p>
                              </div>
                            )}
                      </div>
                    )}

                    {/* Selected Users */}
                    {watchedSelectedUsers.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Selected Users ({watchedSelectedUsers.length})
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                          {watchedSelectedUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-2 bg-brand-purple/10 px-3 py-1 rounded-full"
                            >
                              <span className="text-sm">
                                {user.first_name} {user.last_name}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleUserSelection(user)}
                                className="text-brand-purple hover:text-brand-purple/70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected users validation error */}
                    {errors.selectedUsers && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        At least one user must be selected
                      </p>
                    )}
                  </div>
                )}

                {/* Role Selection (Only for creators) */}
                {isCreator && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">
                      Assign Role *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowRoleSelector(!showRoleSelector)}
                        className="w-full flex items-center justify-between px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple hover:border-brand-purple transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {React.createElement(
                            roles.find((r) => r.value === watchedRole)?.icon ||
                              User,
                            { className: "w-4 h-4 text-brand-purple" }
                          )}
                          <span>
                            {roles.find((r) => r.value === watchedRole)?.label}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            showRoleSelector ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {showRoleSelector && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
                          {roles.map((role) => (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => {
                                setValue("role", role.value);
                                setShowRoleSelector(false);
                                clearErrors("role");
                              }}
                              className="w-full flex items-start gap-3 px-3 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg text-left"
                            >
                              <role.icon className="w-4 h-4 mt-0.5 text-brand-purple" />
                              <div>
                                <p className="text-sm font-medium">
                                  {role.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {role.description}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.role && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Personal Message */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Personal Message (Optional)
                  </label>
                  <Controller
                    name="personalMessage"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        placeholder="Add a personal note to your invitation..."
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent resize-none"
                      />
                    )}
                  />
                </div>

                {/* Guest Allowance */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">
                    Guests Allowed per Invitation
                  </label>
                  <Controller
                    name="maxGuests"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      >
                        <option value={0}>No guests allowed</option>
                        <option value={1}>+1 guest</option>
                        <option value={2}>+2 guests</option>
                        <option value={3}>+3 guests</option>
                        <option value={5}>+5 guests</option>
                      </select>
                    )}
                  />
                  {errors.maxGuests && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.maxGuests.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {activeTab === "email"
                    ? `${watchedEmails.length} email${
                        watchedEmails.length !== 1 ? "s" : ""
                      } to invite`
                    : `${watchedSelectedUsers.length} user${
                        watchedSelectedUsers.length !== 1 ? "s" : ""
                      } selected`}
                  {isCreator &&
                    ` as ${roles
                      .find((r) => r.value === watchedRole)
                      ?.label.toLowerCase()}`}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid() || isLoading}
                    className="px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Invitations
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default InviteUsersModal;
