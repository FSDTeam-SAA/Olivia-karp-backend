import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RecommendationService } from "./recommendation.service";

const getMyRecommendations = catchAsync(async (req, res) => {
  const userId = (req.user as any)?.id || (req.user as any)?._id;
  const result = await RecommendationService.getPersonalizedRecommendations(
    userId,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Personalized recommendations retrieved successfully",
    data: result,
  });
});

export const RecommendationController = {
  getMyRecommendations,
};

