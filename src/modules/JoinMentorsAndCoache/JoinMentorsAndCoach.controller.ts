import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import JoinMentorsAndCoachService from "./JoinMentorsAndCoach.service";

const createJoinMentorsAndCoachIntoDB = catchAsync(async (req, res) => {
  const { email } = req.user!;
  const file = req.file as Express.Multer.File;

  const result =
    await JoinMentorsAndCoachService.createJoinMentorsAndCoachIntoDB(
      file,
      req.body,
      email,
    );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Join mentors and coaches created successfully",
    data: result,
  });
});

const getAllJoinMentorsAndCoaches = catchAsync(async (req, res) => {
  const result = await JoinMentorsAndCoachService.getAllJoinMentorsAndCoaches(
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Join mentors and coaches retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleJoinMentorsAndCoach = catchAsync(async (req, res) => {
  const { joinMentorsAndCoachId } = req.params;
  const result = await JoinMentorsAndCoachService.getSingleJoinMentorsAndCoach(
    joinMentorsAndCoachId,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Join mentors and coaches retrieved successfully",
    data: result,
  });
});

const approvedJoinMentorsAndCoach = catchAsync(async (req, res) => {
  const { joinMentorsAndCoachId } = req.params;
  await JoinMentorsAndCoachService.approvedJoinMentorsAndCoach(
    joinMentorsAndCoachId,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Join mentors and coaches approved successfully",
    // data: result,
  });
});

const toggleMentorAndCoachActive = catchAsync(async (req, res) => {
  const { joinMentorsAndCoachId } = req.params;
  await JoinMentorsAndCoachService.toggleMentorAndCoachActive(
    joinMentorsAndCoachId,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Join mentors and coaches toggled successfully",
    // data: result,
  });
});

const JoinMentorsAndCoachController = {
  createJoinMentorsAndCoachIntoDB,
  getAllJoinMentorsAndCoaches,
  getSingleJoinMentorsAndCoach,
  approvedJoinMentorsAndCoach,
  toggleMentorAndCoachActive,
};

export default JoinMentorsAndCoachController;
