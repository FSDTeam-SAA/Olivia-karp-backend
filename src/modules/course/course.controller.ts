import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import courseService from "./course.service";

const CreateNewCourse = catchAsync(async (req, res) => {
  const files = req.files as Express.Multer.File[];

  const result = await courseService.CreateNewCourse(req.body, files);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "New course created successfully",
    data: result,
  });
});

const getAllCourses = catchAsync(async (req, res) => {
  const result = await courseService.getAllCourses(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Courses retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const result = await courseService.getSingleCourse(courseId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Course retrieved successfully",
    data: result,
  });
});

const courseController = {
  CreateNewCourse,
  getAllCourses,
  getSingleCourse,
};
export default courseController;
