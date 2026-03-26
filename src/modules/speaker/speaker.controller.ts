import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import speakerService from "./speaker.service";

const applyForSpeaker = catchAsync(async (req, res) => {
  const { email } = req.user!;
  const result = await speakerService.applyForSpeaker(email, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Your application has been submitted successfully.",
    data: result,
  });
});

const getAllAppliedSpeakers = catchAsync(async (req, res) => {
  const result = await speakerService.getAllAppliedSpeakers(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Speakers retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleDetailsForSpeaker = catchAsync(async (req, res) => {
  const result = await speakerService.getSingleDetailsForSpeaker(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Speaker details retrieved successfully",
    data: result,
  });
});

const speakerController = {
  applyForSpeaker,
  getAllAppliedSpeakers,
  getSingleDetailsForSpeaker,
};

export default speakerController;
