import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import InterviewService from "./Interview.service";

const createInterview = catchAsync(async (req, res) => {
  const { email } = req.user!;
  const result = await InterviewService.createInterview(req.body, email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Interview created successfully",
    data: result,
  });
});

const getAllInterviews = catchAsync(async (req, res) => {
  const result = await InterviewService.getAllInterviews(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Interviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleInterview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await InterviewService.getSingleInterview(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Interview retrieved successfully",
    data: result,
  });
});

const InterviewController = {
  createInterview,
  getAllInterviews,
  getSingleInterview,
};

export default InterviewController;
