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

const InterviewController = {
  createInterview,
};

export default InterviewController;
