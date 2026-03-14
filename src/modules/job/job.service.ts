import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import {
  uploadToCloudinary,
  uploadVideoToCloudinary,
} from "../../utils/cloudinary";
import { User } from "../user/user.model";
import Job from "./job.model";

interface ICreateJobPayload {
  images?: Express.Multer.File[];
  videos?: Express.Multer.File[];
  companyLogo?: Express.Multer.File;
  [key: string]: any;
}

const createNewJob = async (payload: ICreateJobPayload, email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(
      "No account found with the provided credentials.",
      StatusCodes.NOT_FOUND,
    );
  }

  const { images = [], videos = [], companyLogo, ...jobData } = payload;

  const uploadedImages: { url: string; public_id: string }[] = [];
  const uploadedVideos: { url: string; public_id: string }[] = [];

  // Upload Images
  if (images.length) {
    for (const file of images) {
      const result = await uploadToCloudinary(file.path, "jobs/images");

      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  }

  // Upload Videos
  if (videos.length) {
    for (const file of videos) {
      const result = await uploadVideoToCloudinary(file.path, "jobs/videos");

      uploadedVideos.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  }

  // Upload Company Logo
  let logoData;
  if (companyLogo) {
    const result = await uploadToCloudinary(companyLogo.path, "jobs/logo");

    logoData = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  const newJob = await Job.create({
    ...jobData,
    userId: user._id,
    postedDate: new Date(),
    media: {
      images: uploadedImages,
      videos: uploadedVideos,
    },
    companyLogo: logoData,
  });

  return newJob;
};

const getAllJobs = async (query: Record<string, any>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || "";

  const skip = (page - 1) * limit;

  const searchCondition = search
    ? {
        $or: ["title", "skill", "jobType", "companyName"].map((field) => ({
          [field]: { $regex: search, $options: "i" },
        })),
      }
    : {};

  const [jobs, total] = await Promise.all([
    Job.find(searchCondition).skip(skip).limit(limit).lean(),
    Job.countDocuments(searchCondition),
  ]);

  return {
    data: jobs,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getSingleJob = async (id: string) => {
  const job = await Job.findById(id).lean();
  if (!job) {
    throw new AppError("Job Record not found", StatusCodes.NOT_FOUND);
  }

  return job;
};

const JobService = {
  createNewJob,
  getAllJobs,
  getSingleJob,
};

export default JobService;
