import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import subscriptionPlanService from "./subscriptionPlan.service";

const createNewSubscriptionPlan = catchAsync(async (req, res) => {
  const result = await subscriptionPlanService.createNewSubscriptionPlan(
    req.body,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Subscription plan created successfully",
    data: result,
  });
});

const getAllSubscriptionPlans = catchAsync(async (req, res) => {
  const result = await subscriptionPlanService.getAllSubscriptionPlans();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Subscription plans retrieved successfully",
    data: result,
  });
});

const getSingleSubscriptionPlan = catchAsync(async (req, res) => {
  const { subscriptionPlanId } = req.params;
  const result =
    await subscriptionPlanService.getSingleSubscriptionPlan(subscriptionPlanId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Subscription plan retrieved successfully",
    data: result,
  });
});

const subscriptionPlanController = {
  createNewSubscriptionPlan,
  getAllSubscriptionPlans,
  getSingleSubscriptionPlan,
};

export default subscriptionPlanController;
