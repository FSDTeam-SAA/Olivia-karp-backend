import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import Job from "./job.model";
import { uploadToCloudinary, uploadVideoToCloudinary } from "../../utils/cloudinary";

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


const JobService = {
  createNewJob,
};

export default JobService;
