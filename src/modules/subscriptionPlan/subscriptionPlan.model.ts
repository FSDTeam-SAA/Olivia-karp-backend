import { Schema, model } from "mongoose";
import { ISubscriptionPlan } from "./subscriptionPlan.interface";

const accessLevelEnum = [
  "free",
  "included",
  "limited",
  "full_access",
  "paid",
  "discounted",
  "free_unlimited",
  "free_access",
  "not_available",
  "matchmaking",
  "deeper_networking",
  "long_term_matching",
];

const accessLevelsSchema = new Schema(
  {
    blogAndPodcast: {
      type: String,
      enum: accessLevelEnum,
      default: "free",
    },
    mightyNetworks: {
      type: String,
      enum: accessLevelEnum,
      default: "limited",
    },
    aiChatbot: {
      type: String,
      enum: accessLevelEnum,
      default: "paid",
    },
    events: {
      type: String,
      enum: accessLevelEnum,
      default: "paid",
    },
    courses: {
      type: String,
      enum: accessLevelEnum,
      default: "paid",
    },
    careerServices: {
      type: String,
      enum: accessLevelEnum,
      default: "paid",
    },
    mentorship: {
      type: String,
      enum: accessLevelEnum,
      default: "not_available",
    },
  },
  { _id: false },
);

const discountsSchema = new Schema(
  {
    aiChatbot: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    events: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    courses: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    careerServices: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { _id: false },
);

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    planTier: {
      type: String,
      enum: ["beginner", "monthly", "yearly"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "CAD",
      trim: true,
    },
    billingType: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    features: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    accessLevels: {
      type: accessLevelsSchema,
      default: () => ({}),
    },
    discounts: {
      type: discountsSchema,
      default: () => ({}),
    },
    hasTrial: {
      type: Boolean,
      default: false,
    },
    trialDays: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value: number) {
          if (this.hasTrial) {
            return value > 0;
          }
          return true;
        },
        message: "Trial days must be greater than 0 when trial is enabled",
      },
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

subscriptionPlanSchema.index({ status: 1, order: 1 });
subscriptionPlanSchema.index({ planTier: 1 });

const SubscriptionPlan = model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema,
);

export default SubscriptionPlan;
