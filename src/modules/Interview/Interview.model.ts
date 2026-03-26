import { model, Schema } from "mongoose";
import { IInterview } from "./interview.interface";

const interviewSchema = new Schema<IInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    topic: { type: String, required: true },
    industry: { type: String, required: true },
    professionalBackground: { type: String, required: true },
    focus: { type: String, required: true },
    preferredQuestions: { type: [String], default: [] },
    date: { type: Date, required: true },
    time: { type: String, required: true },
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

const Interview = model<IInterview>("Interview", interviewSchema);
export default Interview;
