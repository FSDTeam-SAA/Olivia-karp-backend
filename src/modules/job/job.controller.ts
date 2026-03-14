import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import JobService from "./job.service";

const createNewJob = catchAsync(async (req, res) => {
  const { email } = req.user!;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const images = files?.images || [];
  const videos = files?.videos || [];
  const companyLogo = files?.companyLogo?.[0];

  const result = await JobService.createNewJob(
    {
      ...req.body,
      images,
      videos,
      companyLogo,
    },
    email,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "New job created successfully",
    data: result,
  });
});

const getAllJobs = catchAsync(async (req, res) => {
  const result = await JobService.getAllJobs(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Jobs retrieved successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleJob = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const result = await JobService.getSingleJob(jobId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Job retrieved successfully.",
    data: result,
  });
});

const JobController = {
  createNewJob,
  getAllJobs,
  getSingleJob,
};

export default JobController;
