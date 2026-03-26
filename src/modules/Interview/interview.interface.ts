import { Types } from "mongoose";

export interface IInterview {
  userId: Types.ObjectId;
  name: string;
  email: string;
  topic: string;
  industry: string;
  professionalBackground: string;
  focus: string;
  preferredQuestions: string[];
  date: Date;
  time: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}
