import { EventCategory } from "@/lib/validations/event";

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  defaultSettings: {
    allow_guests?: boolean;
    auto_approve?: boolean;
    age_restriction?: string;
    is_public?: boolean;
    require_approval?: boolean;
    dress_code?: string;
  };
}

export const eventTemplates: Record<EventCategory, EventTemplate[]> = {
  [EventCategory.Birthday]: [
    {
      id: "birthday-classic",
      name: "Classic Birthday",
      description: "Traditional birthday celebration with cake and decorations",
      imageUrl: "/templates/birthday-classic.jpg",
      defaultSettings: {
        allow_guests: true,
        auto_approve: true,
        age_restriction: "all_ages",
      },
    },
    {
      id: "birthday-surprise",
      name: "Surprise Party",
      description: "Secret celebration for the birthday person",
      imageUrl: "/templates/birthday-surprise.jpg",
      defaultSettings: {
        is_public: false,
        require_approval: true,
        allow_guests: false,
      },
    },
    {
      id: "birthday-milestone",
      name: "Milestone Birthday",
      description: "Special celebration for milestone ages (18, 21, 30, etc.)",
      imageUrl: "/templates/birthday-milestone.jpg",
      defaultSettings: {
        allow_guests: true,
        auto_approve: false,
        age_restriction: "18+",
      },
    },
  ],
  [EventCategory.Wedding]: [
    {
      id: "wedding-ceremony",
      name: "Wedding Ceremony",
      description: "Traditional wedding ceremony and reception",
      imageUrl: "/templates/wedding-ceremony.jpg",
      defaultSettings: {
        is_public: false,
        require_approval: true,
        allow_guests: false,
        dress_code: "formal",
      },
    },
    {
      id: "wedding-reception",
      name: "Wedding Reception",
      description: "Wedding reception and celebration",
      imageUrl: "/templates/wedding-reception.jpg",
      defaultSettings: {
        is_public: false,
        allow_guests: true,
        dress_code: "cocktail",
      },
    },
  ],
  [EventCategory.Party]: [
    {
      id: "party-house",
      name: "House Party",
      description: "Casual house party with friends",
      imageUrl: "/templates/party-house.jpg",
      defaultSettings: {
        is_public: true,
        allow_guests: true,
        auto_approve: true,
      },
    },
    {
      id: "party-cocktail",
      name: "Cocktail Party",
      description: "Elegant cocktail party",
      imageUrl: "/templates/party-cocktail.jpg",
      defaultSettings: {
        dress_code: "cocktail",
        age_restriction: "21+",
        auto_approve: false,
      },
    },
  ],
  [EventCategory.Business]: [
    {
      id: "business-meeting",
      name: "Business Meeting",
      description: "Professional business meeting",
      imageUrl: "/templates/business-meeting.jpg",
      defaultSettings: {
        is_public: false,
        require_approval: true,
        dress_code: "business",
      },
    },
    {
      id: "business-conference",
      name: "Business Conference",
      description: "Large-scale business conference or seminar",
      imageUrl: "/templates/business-conference.jpg",
      defaultSettings: {
        is_public: true,
        require_approval: false,
        dress_code: "business_casual",
      },
    },
  ],
  [EventCategory.Social]: [
    {
      id: "social-networking",
      name: "Networking Event",
      description: "Professional networking and socializing",
      imageUrl: "/templates/social-networking.jpg",
      defaultSettings: {
        is_public: true,
        allow_guests: false,
        auto_approve: true,
        dress_code: "business_casual",
      },
    },
    {
      id: "social-community",
      name: "Community Gathering",
      description: "Local community social event",
      imageUrl: "/templates/social-community.jpg",
      defaultSettings: {
        is_public: true,
        allow_guests: true,
        auto_approve: true,
        age_restriction: "all_ages",
      },
    },
  ],
  [EventCategory.Proposal]: [
    {
      id: "proposal-romantic",
      name: "Romantic Proposal",
      description: "Intimate marriage proposal setting",
      imageUrl: "/templates/proposal-romantic.jpg",
      defaultSettings: {
        is_public: false,
        require_approval: true,
        allow_guests: false,
        dress_code: "formal",
      },
    },
  ],
  [EventCategory.Custom]: [
    {
      id: "custom-general",
      name: "General Event",
      description: "Create a custom event from scratch",
      imageUrl: "/templates/custom-general.jpg",
      defaultSettings: {
        is_public: true,
        auto_approve: true,
        allow_guests: true,
      },
    },
  ],
};
