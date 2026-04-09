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

const getAllAppliedJobs = async (query: any) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const searchRegex = query.search ? new RegExp(query.search, "i") : null;
  const statusFilter = query.status?.length ? query.status : [];

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

  // 🔥 FACET
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      totalCount: [{ $count: "total" }],
      analytics: [
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ],
    },
  });

  const result = await ApplyJob.aggregate(pipeline);

  const data = result[0].data;
  const total = result[0].totalCount[0]?.total || 0;

  const analyticsRaw = result[0].analytics;

  // =========================
  // 🔹 BASE ANALYTICS
  // =========================
  const analytics = {
    totalApplyJobs: total,
    totalPendingJobs:
      analyticsRaw.find((a: any) => a._id === "pending")?.count || 0,
    totalRejectedJobs:
      analyticsRaw.find((a: any) => a._id === "rejected")?.count || 0,
    totalAcceptedJobs:
      analyticsRaw.find((a: any) => a._id === "accepted")?.count || 0,
  };

  // =========================
  // 🔥 7 DAYS GROWTH CALCULATION
  // =========================

  const now = new Date();

  const last7DaysStart = new Date();
  last7DaysStart.setDate(now.getDate() - 7);

  const prev7DaysStart = new Date();
  prev7DaysStart.setDate(now.getDate() - 14);

  const prev7DaysEnd = new Date();
  prev7DaysEnd.setDate(now.getDate() - 7);

  // Pending
  const currentPending = await ApplyJob.countDocuments({
    status: "pending",
    appliedAt: { $gte: last7DaysStart, $lte: now },
  });

  const previousPending = await ApplyJob.countDocuments({
    status: "pending",
    appliedAt: { $gte: prev7DaysStart, $lte: prev7DaysEnd },
  });

  const pendingGrowth =
    previousPending === 0
      ? currentPending > 0
        ? 100
        : 0
      : ((currentPending - previousPending) / previousPending) * 100;

  // Accepted
  const currentAccepted = await ApplyJob.countDocuments({
    status: "accepted",
    appliedAt: { $gte: last7DaysStart, $lte: now },
  });

  const previousAccepted = await ApplyJob.countDocuments({
    status: "accepted",
    appliedAt: { $gte: prev7DaysStart, $lte: prev7DaysEnd },
  });

  const acceptedGrowth =
    previousAccepted === 0
      ? currentAccepted > 0
        ? 100
        : 0
      : ((currentAccepted - previousAccepted) / previousAccepted) * 100;

  // =========================
  // 🎯 FINAL RETURN
  // =========================

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    analytics: {
      ...analytics,
      pendingGrowth: Number(pendingGrowth.toFixed(0)),
      acceptedGrowth: Number(acceptedGrowth.toFixed(0)),
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

const updateStatus = async (id: string, payload: any) => {
  const { status } = payload;
  const isExist = await ApplyJob.findById(id);
  if (!isExist) {
    throw new AppError("Job apply record not found", StatusCodes.NOT_FOUND);
  }

  const result = await ApplyJob.findOneAndUpdate(
    { _id: id },
    { status },
    { new: true },
  );
  return result;
};

const deletedAppliedJob = async (id: string) => {
  const applyJob = await ApplyJob.findById(id);
  if (!applyJob) {
    throw new AppError("Job apply record not found", StatusCodes.NOT_FOUND);
  }

  if (applyJob.status !== "rejected") {
    throw new AppError(
      "Only rejected job applications can be deleted",
      StatusCodes.BAD_REQUEST,
    );
  }

  await ApplyJob.findByIdAndDelete(id);
};

const ApplyJobService = {
  applyForJobService,
  getAllAppliedJobs,
  getSingleAppliedJob,
  updateStatus,
  deletedAppliedJob,
};

export default ApplyJobService;
