import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import purchaseSubscriptionService from "./purchaseSubscription.service";

const getUserBenefits = catchAsync(async (req, res) => {
  const userId = req.user!._id;
  const result = await purchaseSubscriptionService.getUserBenefits(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User benefits retrieved successfully",
    data: result,
  });
});

const getMySubscription = catchAsync(async (req, res) => {
  const { email } = req.user!;
  const result = await purchaseSubscriptionService.getMySubscription(email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Subscriptions retrieved successfully",
    data: result,
  });
});

const getAllSubscriptions = catchAsync(async (req, res) => {
  const result = await purchaseSubscriptionService.getAllSubscriptions(
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All subscriptions retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const purchaseSubscriptionController = {
  getUserBenefits,
  getMySubscription,
  getAllSubscriptions,
};

export default purchaseSubscriptionController;
