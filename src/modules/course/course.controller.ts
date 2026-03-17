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

const courseController = {
  CreateNewCourse,
};
export default courseController;
