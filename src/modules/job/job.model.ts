import mongoose, { Schema } from "mongoose";
import { IJob } from "./job.interface";

const jobSchema = new Schema<IJob>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    category: { type: String, required: true },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      required: true,
    },
    location: { type: String, required: true },
    description: { type: String, required: true },
    responsibility: { type: String, required: true },
    requirement: { type: String, required: true },
    skill: { type: String, required: true },
    companyName: { type: String, required: true },
    companyURL: { type: String },
    companyLogo: {
      url: { type: String },
      public_id: { type: String },
    },
    media: {
      images: [
        {
          url: { type: String, required: true },
          public_id: { type: String, required: true },
        },
      ],
      videos: [
        {
          url: { type: String, required: true },
          public_id: { type: String, required: true },
        },
      ],
    },
    deathLine: { type: Date, required: true },
    postedDate: { type: Date, default: Date.now },
    hiredCount: { type: Number, default: 0 },
    totalHiredCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "closed", "filled"],
      default: "open",
    },
    salary: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, required: true },
      period: {
        type: String,
        enum: ["hour", "day", "month", "year"],
        required: true,
      },
    },
  },
  { timestamps: true, versionKey: false },
);

const Job = mongoose.model<IJob>("Job", jobSchema);
export default Job;
