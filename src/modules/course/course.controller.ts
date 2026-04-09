import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import courseService from "./course.service";
import httpStatus from "http-status";
import { Request, Response } from "express";

const CreateNewCourse = catchAsync(async (req: Request, res: Response) => {
  // Cast req.files to the Record type for .fields() support
  const files = req.files as Record<string, Express.Multer.File[]>;
  
  const result = await courseService.CreateNewCourse(req.body, files);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Course created successfully",
    data: result,
  });
});

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await courseService.getAllCourses(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await courseService.getSingleCourse(req.params.courseId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course retrieved successfully",
    data: result,
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const result = await courseService.updateCourse(req.params.courseId, req.body, files);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course updated successfully",
    data: result,
  });
});

const updateCourseAvailability = catchAsync(async (req: Request, res: Response) => {
  const result = await courseService.updateCourseAvailability(req.params.courseId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Availability toggled successfully",
    data: result,
  });
});

const courseController = {
  CreateNewCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  updateCourseAvailability,
};
export default courseController;
