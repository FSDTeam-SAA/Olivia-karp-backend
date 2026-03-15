import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { uploadToCloudinary } from "../../utils/cloudinary";
import Job from "../job/job.model";
import { User } from "../user/user.model";
import { IApplyJob } from "./applyJob.interface";
import ApplyJob from "./applyJob.model";

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

  await Job.findByIdAndUpdate(
    payload.jobId,
    [
      {
        $set: {
          hiredCount: { $add: ["$hiredCount", 1] },
          status: {
            $cond: [
              { $gte: [{ $add: ["$hiredCount", 1] }, "$totalHiredCount"] },
              "filled",
              "$status",
            ],
          },
        },
      },
    ],
    { new: true },
  );

  return application;
};

const getAllAppliedJobs = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
}) => {
  const page = parseInt(query.page as any) || 1;
  const limit = parseInt(query.limit as any) || 10;
  const skip = (page - 1) * limit;

  const searchRegex = query.search ? new RegExp(query.search, "i") : null;
  const statusFilter = query.status && query.status.length ? query.status : [];

  const matchStage: any = {};

  if (statusFilter.length) {
    matchStage.status = { $in: statusFilter };
  }

  const pipeline: any[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: "jobs",
        localField: "jobId",
        foreignField: "_id",
        as: "job",
      },
    },
    { $unwind: "$job" },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ];

  // Add search filter
  if (searchRegex) {
    pipeline.push({
      $match: {
        $or: [
          { "job.title": searchRegex },
          { "job.category": searchRegex },
          { "user.firstName": searchRegex },
          { "user.lastName": searchRegex },
        ],
      },
    });
  }

  // Project only required fields
  pipeline.push({
    $project: {
      _id: 1,
      coverLetter: 1,
      portfolioUrl: 1,
      linkedinUrl: 1,
      status: 1,
      appliedAt: 1,
      jobId: {
        _id: "$job._id",
        title: "$job.title",
        category: "$job.category",
      },
      userId: {
        _id: "$user._id",
        firstName: "$user.firstName",
        lastName: "$user.lastName",
        email: "$user.email",
      },
    },
  });

  // Count total
  const countPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await ApplyJob.aggregate(countPipeline);
  const total = totalResult[0]?.total || 0;

  // Pagination
  pipeline.push({ $skip: skip }, { $limit: limit });

  const result = await ApplyJob.aggregate(pipeline);

  return {
    data: result,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getSingleAppliedJob = async (id: string) => {
  const result = await ApplyJob.findById(id)
    .populate("jobId", "title category") // only include fields you want from Job
    .populate(
      "userId",
      "-password -__v -created_at -updated_at, -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires",
    ); // exclude sensitive fields

  if (!result) {
    throw new AppError("Job apply record not found", StatusCodes.NOT_FOUND);
  }

  return result;
};

const ApplyJobService = {
  applyForJobService,
  getAllAppliedJobs,
  getSingleAppliedJob,
};

export default ApplyJobService;
