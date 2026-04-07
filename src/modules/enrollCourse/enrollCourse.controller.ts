import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import enrollCourseService from "./enrollCourse.service";

const createEnrollCourse = catchAsync(async (req, res) => {
    const {email} = req.user!
  const result = await enrollCourseService.createEnrollCourse(req.body, email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Enroll course created successfully",
    data: result,
  });
});

const enrollCourseController = {
  createEnrollCourse,
};

export default enrollCourseController;
