import { Types } from "mongoose";

export interface ISpeaker {
  name: string;
  email: string;
  specialization: string;
  industry: string;
  professionalBackground: string;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  climateMatters: string;
  status: "pending" | "approved" | "rejected";
}
