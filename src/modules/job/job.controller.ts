import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import JobService from "./job.service";

const createNewJob = catchAsync(async (req, res) => {
  const result = await JobService.createNewJob(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "New job created successfully.",
    data: result,
  });
});

const JobController = {
  createNewJob,
};

export default JobController;
