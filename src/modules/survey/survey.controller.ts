import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import SurveyService from "./survey.service";

const createNewSurvey = catchAsync(async (req, res) => {
  const { email } = req.user!;
  const result = await SurveyService.createNewSurvey(req.body, email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "New survey created successfully",
    data: result,
  });
});

const surveyController = {
  createNewSurvey,
};

export default surveyController;
