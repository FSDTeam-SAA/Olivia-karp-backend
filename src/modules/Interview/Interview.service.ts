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

const InterviewService = {
  createInterview,
};

export default InterviewService;
