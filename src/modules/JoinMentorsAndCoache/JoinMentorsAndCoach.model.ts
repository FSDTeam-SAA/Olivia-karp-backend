import { Schema, model } from "mongoose";
import { IJoinMentorsAndCoach } from "./JoinMentorsAndCoach.interface";

const joinMentorCoachSchema = new Schema<IJoinMentorsAndCoach>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    designation: { type: String },
    bio: { type: String, required: true },
    about: { type: String, required: true },
    image: {
      url: { type: String },
      public_id: { type: String },
    },
    type: { type: String, enum: ["mentor", "coach"], required: true },
    skills: { type: [String], default: [] },
    support: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    languages: { type: [String], default: [] },
    experienceYears: { type: Number, required: true },
    linkedin: { type: String, default: "" },
    website: { type: String, default: "" },
    isPaidSession: { type: Boolean, required: true },
    hourlyRate: { type: Number, default: 0 },
    bookingLink: { type: String, required: true },
    motivation: { type: String },
    goal: { type: String },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalSessions: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

const JoinMentorCoach = model<IJoinMentorsAndCoach>(
  "JoinMentorCoach",
  joinMentorCoachSchema,
);

export default JoinMentorCoach;
