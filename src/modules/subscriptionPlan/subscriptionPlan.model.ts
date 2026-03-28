import { Schema, model } from "mongoose";
import { ISubscriptionPlan } from "./subscriptionPlan.interface";

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
    price: {
      type: Number,
      required: true,
      min: 0,
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

const SubscriptionPlan = model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema,
);

export default SubscriptionPlan;
