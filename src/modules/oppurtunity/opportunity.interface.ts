import { Types } from "mongoose";

export interface IOpportunity {
  title: string;
  organizationName: string;
  opportunityType: string;
  location: string;
  officialLink: string;
  shortDescription: string;
  submittedBy?: Types.ObjectId; // Link to the user who submitted
  partnerId?: Types.ObjectId;
  isPartnerOpportunity?: boolean;
  status: "pending" | "reviewed" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}
