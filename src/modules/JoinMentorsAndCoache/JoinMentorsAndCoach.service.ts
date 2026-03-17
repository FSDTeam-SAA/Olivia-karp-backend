import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { uploadToCloudinary } from "../../utils/cloudinary";
import JoinMentorCoach from "./JoinMentorsAndCoach.model";

const createJoinMentorsAndCoachIntoDB = async (
  file: Express.Multer.File,
  payload: any,
) => {
  const emailExists = await JoinMentorCoach.findOne({ email: payload.email });
  if (emailExists) {
    throw new AppError("This email already exists", StatusCodes.BAD_REQUEST);
  }

  if (file) {
    const imageData = await uploadToCloudinary(file.path, "mentors-coaches");

    payload.image = {
      url: imageData.secure_url,
      public_id: imageData.public_id,
    };
  } else {
    throw new AppError("Image is required", StatusCodes.BAD_REQUEST);
  }

  const result = await JoinMentorCoach.create(payload);

  return result;
};

const JoinMentorsAndCoachService = {
  createJoinMentorsAndCoachIntoDB,
};

export default JoinMentorsAndCoachService;
