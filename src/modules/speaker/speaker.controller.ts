import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import speakerService from "./speaker.service";

const applyForSpeaker = catchAsync(async (req, res) => {
  const { email } = req.user!;
  const result = await speakerService.applyForSpeaker(email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Your application has been submitted successfully.",
    data: result,
  });
});

const speakerController = {
  applyForSpeaker,
};

export default speakerController;
