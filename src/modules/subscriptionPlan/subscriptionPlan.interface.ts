interface ISubscriptionPlan {
  name: string;
  description: string;
  price: number;
  billingType: "monthly" | "yearly";
  features: string[];
  hasTrial: boolean;
  trialDays?: number;
  isHighlighted: boolean;
  status: "active" | "inactive";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
