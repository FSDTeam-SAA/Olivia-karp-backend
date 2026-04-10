import { Types } from "mongoose";

export interface IOpportunity {
  title: string;
  organizationName: string;
  opportunityType: string;
  location: string;
  officialLink: string;
  shortDescription: string;
  submittedBy: Types.ObjectId; // Link to the user who submitted
  status: "pending" | "reviewed" | "rejected";
}