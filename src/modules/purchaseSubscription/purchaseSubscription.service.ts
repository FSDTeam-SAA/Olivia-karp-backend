import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import SubscriptionPlan from "../subscriptionPlan/subscriptionPlan.model";
import { User } from "../user/user.model";
import { IPurchaseSubscription } from "./purchaseSubscription.interface";

const createPurchaseSubscription = async (
  payload: IPurchaseSubscription,
  email: string,
) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      "No account found with the provided credentials.",
      StatusCodes.NOT_FOUND,
    );
  }

  const subscription = await SubscriptionPlan.findOne({
    _id: payload.subscriptionId,
  });
  if (!subscription) {
    throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);
  }
};

const purchaseSubscriptionService = {
  createPurchaseSubscription,
};

export default purchaseSubscriptionService;
