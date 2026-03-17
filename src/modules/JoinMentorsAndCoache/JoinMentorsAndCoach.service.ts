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

const getAllJoinMentorsAndCoaches = async (query: any) => {
  const { searchTerm, type, page = 1, limit = 10 } = query;

  const filter: any = {};

  // filter mentor / coach
  if (type) {
    filter.type = type;
  }

  // search
  if (searchTerm) {
    filter.$or = [
      { firstName: { $regex: searchTerm, $options: "i" } },
      { lastName: { $regex: searchTerm, $options: "i" } },
      { skills: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const result = await JoinMentorCoach.find(filter)
    .skip(skip)
    .limit(limitNumber)
    .sort({ createdAt: -1 });

  const total = await JoinMentorCoach.countDocuments(filter);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data: result,
  };
};

const getSingleJoinMentorsAndCoach = async (id: string) => {
  const result = await JoinMentorCoach.findById(id);
  if (!result) {
    throw new AppError(
      "Join mentors and coaches not found",
      StatusCodes.NOT_FOUND,
    );
  }

  return result;
};

const JoinMentorsAndCoachService = {
  createJoinMentorsAndCoachIntoDB,
  getAllJoinMentorsAndCoaches,
  getSingleJoinMentorsAndCoach,
};

export default JoinMentorsAndCoachService;
