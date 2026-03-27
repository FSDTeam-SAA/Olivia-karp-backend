import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { IInterview } from "./interview.interface";
import Interview from "./Interview.model";

const createInterview = async (payload: IInterview, email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      "No account found with the provided credentials.",
      StatusCodes.NOT_FOUND,
    );
  }
  const result = await Interview.create({
    ...payload,
    userId: user._id,
  });
  return result;
};

const getAllInterviews = async (query: any) => {
  const { status, searchTerm, page = 1, limit = 10 } = query;

  const filter: any = {};

  // ✅ Status filter
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  // ✅ Search by name or email or topic (optional)
  if (searchTerm) {
    filter.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { topic: { $regex: searchTerm, $options: "i" } },
      { industry: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // ✅ Pagination
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const data = await Interview.find(filter)
    .skip(skip)
    .limit(limitNumber)
    .sort({ createdAt: -1 });

  const total = await Interview.countDocuments(filter);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data,
  };
};

const InterviewService = {
  createInterview,
  getAllInterviews,
};

export default InterviewService;
