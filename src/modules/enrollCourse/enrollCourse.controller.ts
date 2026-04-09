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

const verifyPayment = catchAsync(async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    throw new Error("Session ID is required for verification.");
  }

  const result = await enrollCourseService.verifyPaymentStatus(session_id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment verified successfully",
    data: result,
  });
});


const enrollCourseController = {
  createEnrollCourse,
  getMyEnrollments,
  verifyPayment,
};

export default enrollCourseController;
