import { Types } from "mongoose";

export interface ISurvey {
  userId: Types.ObjectId;
  name: string;
  email: string;
  city: string;
  country: string;
  link?: string;
  climateJourney: string;
  message: string;
  interest: string[];
  goals: string[];
  successMessage: string;
  whatLooking: string[];
  engagementPreference: string;
  opportunity: string;
  hubs: string;
  region: string;
  impactNewsletter: boolean;
  localNotification: boolean;
  updateFrequency: string;
  tellAbout: string;
  createdAt: Date;
  updatedAt: Date;
}
