import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import ApplyJobService from "./applyJob.service";

const applyForJob = catchAsync(async (req, res) => {
  const result = await ApplyJobService.applyForJobService();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Job applied successfully",
    data: result,
  });
});

const ApplyJobController = {
  applyForJob,
};

export default ApplyJobController;
