import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import purchaseSubscriptionService from "./purchaseSubscription.service";

const createPurchaseSubscription = catchAsync(async (req, res) => {
  const result = await purchaseSubscriptionService.createPurchaseSubscription(
    req.body,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Subscription created successfully",
    data: result,
  });
});

const purchaseSubscriptionController = {
  createPurchaseSubscription,
};

export default purchaseSubscriptionController;
