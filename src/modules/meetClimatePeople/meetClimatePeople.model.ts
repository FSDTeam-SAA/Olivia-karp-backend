import { Schema, model } from "mongoose";
import { IMeetClimateProfile } from "./meetClimatePeople.interface";

const MeetClimateProfileSchema = new Schema<IMeetClimateProfile>(
  {
    mightyMemberId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      select: false, // excluded by default from queries for privacy
    },
    professionalTitle: {
      type: String,
      default: "Climate Community Member",
      trim: true,
    },
    organization: {
      type: String,
      default: "Act on Climate Community",
      trim: true,
    },
    about: {
      type: String,
      default: "",
    },
    climateInterests: {
      type: [String],
      default: [],
      index: true,
    },
    professionalAreas: {
      type: [String],
      default: [],
      index: true,
    },
    education: {
      type: Schema.Types.Mixed,
      default: [],
    },
    experience: {
      type: Schema.Types.Mixed,
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    areasOfExpertise: {
      type: [String],
      default: [],
    },
    lookingFor: {
      type: [String],
      default: [],
      index: true,
    },
    canHelpWith: {
      type: [String],
      default: [],
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    portfolio: {
      type: String,
      default: "",
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    mightyPermalink: {
      type: String,
      default: "",
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
    syncStatus: {
      type: String,
      enum: ["synced", "manual", "pending"],
      default: "synced",
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound text index for fast search across key fields
MeetClimateProfileSchema.index(
  {
    name: "text",
    professionalTitle: "text",
    organization: "text",
    skills: "text",
    climateInterests: "text",
    areasOfExpertise: "text",
  },
  {
    weights: {
      name: 10,
      professionalTitle: 5,
      skills: 4,
      climateInterests: 4,
      organization: 3,
      areasOfExpertise: 2,
    },
    name: "MeetClimateProfileTextIndex",
  }
);

export const MeetClimateProfile = model<IMeetClimateProfile>(
  "MeetClimateProfile",
  MeetClimateProfileSchema
);
