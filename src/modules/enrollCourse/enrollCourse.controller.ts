import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import enrollCourseService from "./enrollCourse.service";


const createEnrollCourse = catchAsync(async (req, res) => {
  const { email } = req.user!;
  const result = await enrollCourseService.createEnrollCourse(req.body, email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Enroll course created successfully",
    data: result,
  });
});

const getMyEnrollments = catchAsync(async (req, res) => {
  const userId = (req.user as any)?._id || (req.user as any)?.id;
  
  const result = await enrollCourseService.getMyEnrollments(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Enrollments retrieved successfully",
    data: result,
  });
});



const enrollCourseController = {
  createEnrollCourse,
  getMyEnrollments,
};

export default enrollCourseController;
