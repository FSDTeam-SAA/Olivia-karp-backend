export type TPlanTier = "beginner" | "monthly" | "yearly";

export type TAccessLevel =
  | "free"
  | "included"
  | "limited"
  | "full_access"
  | "paid"
  | "discounted"
  | "free_unlimited"
  | "free_access"
  | "not_available"
  | "matchmaking"
  | "deeper_networking"
  | "long_term_matching";

export interface IAccessLevels {
  blogAndPodcast: TAccessLevel;
  mightyNetworks: TAccessLevel;
  aiChatbot: TAccessLevel;
  events: TAccessLevel;
  courses: TAccessLevel;
  careerServices: TAccessLevel;
  mentorship: TAccessLevel;
}

export interface IDiscounts {
  aiChatbot: number; // percentage discount (0–100)
  events: number;
  courses: number;
  careerServices: number;
}

export interface ISubscriptionPlan {
  title: string;
  description: string;
  planTier: TPlanTier;
  price: number;
  currency: string;
  billingType: "monthly" | "yearly";
  features: string[];
  accessLevels: IAccessLevels;
  discounts: IDiscounts;
  hasTrial: boolean;
  trialDays?: number;
  isHighlighted: boolean;
  status: "active" | "inactive";
  order: number;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}
