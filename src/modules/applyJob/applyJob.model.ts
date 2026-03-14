import { model, Schema } from "mongoose";
import { IApplyJob } from "./applyJob.interface";

const applyJobSchema = new Schema<IApplyJob>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    coverLetter: String,
    resume: {
      url: String,
      public_id: String,
    },
    portfolioUrl: String,
    linkedinUrl: String,
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected", "accepted"],
      default: "pending",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false },
);

const ApplyJob = model<IApplyJob>("ApplyJob", applyJobSchema);
export default ApplyJob;
