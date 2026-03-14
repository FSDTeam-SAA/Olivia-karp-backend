import { Types } from "mongoose";

export type JobApplicationStatus =
  | "pending"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "accepted";

export interface IResumeFile {
  url: string;
  public_id: string;
  fileName?: string;
}

export interface IApplyJob {
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
  coverLetter?: string;
  resume?: IResumeFile;
  portfolioUrl?: string;
  linkedinUrl?: string;
  status: JobApplicationStatus;
  appliedAt: Date;
  updatedAt?: Date;
}


export interface GetAppliedJobsOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string[];
}