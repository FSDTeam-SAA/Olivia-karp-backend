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

// Controller
const getAllAppliedJobs = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;

  const result = await ApplyJobService.getAllAppliedJobs({
    page: Number(page),
    limit: Number(limit),
    search: search as string,
    status: status ? (status as string).split(",") : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Applied jobs retrieved successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleAppliedJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ApplyJobService.getSingleAppliedJob(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Applied job retrieved successfully.",
    data: result,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ApplyJobService.updateStatus(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Applied job status updated successfully.",
    data: result,
  });
});

const deletedAppliedJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ApplyJobService.deletedAppliedJob(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Applied job deleted successfully.",
  });
});

const ApplyJobController = {
  applyForJob,
  getAllAppliedJobs,
  getSingleAppliedJob,
  updateStatus,
  deletedAppliedJob,
};

export default ApplyJobController;
