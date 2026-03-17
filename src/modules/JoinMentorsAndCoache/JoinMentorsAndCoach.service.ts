import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { IJoinMentorsAndCoach } from "./JoinMentorsAndCoach.interface";
import JoinMentorCoach from "./JoinMentorsAndCoach.model";

const createJoinMentorsAndCoachIntoDB = async (
  file: Express.Multer.File,
  payload: any, // Record<string, any>
) => {
  const emailExists = await JoinMentorCoach.findOne({ email: payload.email });
  if (emailExists) {
    throw new AppError("This email already exists", StatusCodes.BAD_REQUEST);
  }

  // ✅ No JSON.parse for indexed array fields
  // skills, languages, support, experience already array

  if (file) {
    // const imageName = `${payload.firstName}-${Date.now()}`;
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
