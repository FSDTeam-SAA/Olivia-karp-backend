import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import paymentService from "./payment.service";

const createPaymentForSubscription = catchAsync(async (req, res) => {
  const { subscriptionPlanId } = req.body;
  const { email } = req.user!;
  const result = await paymentService.createPaymentForSubscription(
    subscriptionPlanId,
    email,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Subscription created successfully",
    data: result,
  });
});

const stripeWebhookHandler = catchAsync(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const result = await paymentService.stripeWebhookHandler(sig, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Stripe webhook handled successfully",
    data: result,
  });
});

const paymentController = {
  createPaymentForSubscription,
  stripeWebhookHandler,
};

export default paymentController;
