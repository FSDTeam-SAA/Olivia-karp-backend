import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
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
  if (!user)
    throw new AppError(
      "No account found with the provided credentials.",
      StatusCodes.NOT_FOUND,
    );

  const { images = [], videos = [], companyLogo, ...jobData } = payload;

  const imagePaths: string[] = [];
  const videoPaths: string[] = [];

  // images
  if (images.length) {
    for (const file of images) {
      imagePaths.push(file.path);
    }
  }

  // videos
  if (videos.length) {
    for (const file of videos) {
      videoPaths.push(file.path);
    }
  }

  // company logo
  let logoData;
  if (companyLogo) {
    logoData = {
      url: companyLogo.path,
      public_id: companyLogo.filename,
    };
  }

  const newJob = await Job.create({
    ...jobData,
    userId: user._id,
    postedDate: new Date(),
    media: {
      images: imagePaths,
      videos: videoPaths,
    },
    companyLogo: logoData,
  });

  return newJob;
};

const JobService = {
  createNewJob,
};

export default JobService;
