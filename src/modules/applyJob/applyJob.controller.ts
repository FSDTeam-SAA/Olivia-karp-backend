import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import ApplyJobService from "./applyJob.service";

const applyForJob = catchAsync(async (req, res) => {
  const { email } = req.user!;
  const file = req.file as Express.Multer.File;
  const result = await ApplyJobService.applyForJobService(
    email,
    file,
    req.body,
  );

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
