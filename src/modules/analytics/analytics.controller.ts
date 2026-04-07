import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import analyticsService from "./analytics.service";

const getCourserAnalytics = catchAsync(async (req, res) => {
  const result = await analyticsService.getCourserAnalytics();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Courses retrieved successfully",
    data: result,
  });
});

const analyticsController = {
  getCourserAnalytics,
};

export default analyticsController;
