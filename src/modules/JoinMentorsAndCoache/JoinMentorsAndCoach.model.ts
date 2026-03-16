import { Schema, model } from "mongoose";
import { IJoinMentorsAndCoach } from "./JoinMentorsAndCoach.interface";

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const supportSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const experienceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const joinMentorCoachSchema = new Schema<IJoinMentorsAndCoach>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    bio: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    image: {
      type: imageSchema,
      required: true,
    },
    type: {
      type: String,
      enum: ["mentor", "coach"],
      required: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    support: {
      type: [supportSchema],
      default: [],
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    languages: {
      type: [String],
      required: true,
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    availability: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    website: {
      type: String,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const JoinMentorCoach = model<IJoinMentorsAndCoach>(
  "JoinMentorCoach",
  joinMentorCoachSchema,
);

export default JoinMentorCoach;
