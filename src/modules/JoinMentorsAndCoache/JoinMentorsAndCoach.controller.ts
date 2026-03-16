import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import JoinMentorsAndCoachService from "./JoinMentorsAndCoach.service";

const createJoinMentorsAndCoachIntoDB = catchAsync(async (req, res) => {
  const file = req.file as Express.Multer.File;

  const result =
    await JoinMentorsAndCoachService.createJoinMentorsAndCoachIntoDB(
      file,
      req.body,
    );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Join mentors and coaches created successfully",
    data: result,
  });
});

const JoinMentorsAndCoachController = {
  createJoinMentorsAndCoachIntoDB,
};

export default JoinMentorsAndCoachController;
