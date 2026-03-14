import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import Job from "../job/job.model";
import { User } from "../user/user.model";
import { IApplyJob } from "./applyJob.interface";
import ApplyJob from "./applyJob.model";
import { uploadToCloudinary } from "../../utils/cloudinary";

const applyForJobService = async (
  email: string,
  file: Express.Multer.File,
  payload: IApplyJob,
) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      "No account found with the provided credentials.",
      StatusCodes.NOT_FOUND,
    );
  }

  // check job exists
  const job = await Job.findById(payload.jobId);
  if (!job) {
    throw new AppError("Job record not found", StatusCodes.NOT_FOUND);
  }

  // job status validation
  if (job.status !== "open") {
    throw new AppError(
      "This job is not accepting applications",
      StatusCodes.BAD_REQUEST,
    );
  }

  // deadline validation
  const currentDate = new Date();
  if (job.deathLine && currentDate > job.deathLine) {
    throw new AppError(
      "Application deadline has passed",
      StatusCodes.BAD_REQUEST,
    );
  }

  // job capacity validation
  if (job.totalHiredCount && job.hiredCount! >= job.totalHiredCount) {
    throw new AppError(
      "This job position is already filled",
      StatusCodes.BAD_REQUEST,
    );
  }

  // duplicate apply check
  const alreadyApplied = await ApplyJob.findOne({
    jobId: payload.jobId,
    userId: user._id,
  });
  if (alreadyApplied) {
    throw new AppError(
      "You have already applied for this job",
      StatusCodes.BAD_REQUEST,
    );
  }

  // upload resume
  let resumeData;

  if (file) {
    const result = await uploadToCloudinary(file.path, "jobs/resume");
    resumeData = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  // create application
  const application = await ApplyJob.create({
    jobId: payload.jobId,
    userId: user._id,
    coverLetter: payload.coverLetter,
    portfolioUrl: payload.portfolioUrl,
    linkedinUrl: payload.linkedinUrl,
    resume: resumeData,
    status: "pending",
    appliedAt: new Date(),
  });

  return application;
};


const ApplyJobService = {
  applyForJobService,
};

export default ApplyJobService;
