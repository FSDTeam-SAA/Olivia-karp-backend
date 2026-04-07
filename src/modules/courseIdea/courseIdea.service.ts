import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { createNotification } from "../../socket/notification.service";
import { User } from "../user/user.model";
import { ICourseIdea } from "./courseIdea.interface";
import { CourseIdea } from "./courseIdea.model";

const submitIdeaIntoDB = async (payload: ICourseIdea) => {
  // Logic 1: Duplicate Title Check (SEO best practice)
  const isExist = await CourseIdea.findOne({ title: payload.title });
  if (isExist) {
    throw new AppError(
      "A course idea with this title already exists. Please use a unique title.",
      httpStatus.CONFLICT,
    );
  }

  // Logic 2: Mandatory Featured Check
  const result = await CourseIdea.create(payload);

  const admin = await User.findOne({ role: "admin" });

  await createNotification({
    to: new mongoose.Types.ObjectId(admin!._id),
    message: "New course idea submitted",
    type: "COURSE_IDEA",
    title: result.title,
    id: new mongoose.Types.ObjectId(result._id),
  });

  return result;
};

const getAllIdeasFromDB = async (query: Record<string, unknown>) => {
  // 1. Set defaults for page and limit
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;

  // 2. Calculate the number of documents to skip
  const skip = (page - 1) * limit;

  // 3. Execute both queries in parallel for efficiency
  const [result, total] = await Promise.all([
    CourseIdea.find()
      .populate("submittedBy", "name email image")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit),
    CourseIdea.countDocuments(),
  ]);

  // 4. Calculate total pages
  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    result,
  };
};

const getSingleIdeaFromDB = async (courseIdeaId: string) => {
  const result = await CourseIdea.findById(courseIdeaId).populate(
    "submittedBy",
    "name email image",
  );

  // Throw error ONLY if the database didn't find the document
  if (!result) {
    throw new AppError("Course idea not found", httpStatus.NOT_FOUND);
  }

  return result;
};

import mongoose from "mongoose";

const deleteCourseIdeaFromDB = async (courseIdeaId: string) => {
  const result = await CourseIdea.findByIdAndDelete(courseIdeaId);

  return result;
};

const updateStatusInDB = async (courseIdeaId: string, status: string) => {
  const result = await CourseIdea.findByIdAndUpdate(
    courseIdeaId,
    { status },
    { new: true, runValidators: true }, // runValidators ensures the status matches your Enum
  );

  if (!result) {
    throw new AppError("Course idea not found", httpStatus.NOT_FOUND);
  }

  return result;
};

export const CourseIdeaServices = {
  submitIdeaIntoDB,
  getAllIdeasFromDB,
  getSingleIdeaFromDB,
  deleteCourseIdeaFromDB,
  updateStatusInDB,
};
