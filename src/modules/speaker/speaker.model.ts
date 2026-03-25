import { model, Schema } from "mongoose";
import { ISpeaker } from "./speaker.interface";

const speakerSchema = new Schema<ISpeaker>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    professionalBackground: {
      type: String,
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    climateMatters: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Speaker = model<ISpeaker>("Speaker", speakerSchema);
export default Speaker;
