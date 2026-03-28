import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { ISubscriptionPlan } from "./subscriptionPlan.interface";
import SubscriptionPlan from "./subscriptionPlan.model";

const createNewSubscriptionPlan = async (payload: ISubscriptionPlan) => {
  const total = await SubscriptionPlan.countDocuments();
  if (total >= 3) {
    throw new AppError(
      "You can only create up to 3 subscription plans",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (payload.hasTrial && (!payload.trialDays || payload.trialDays <= 0)) {
    throw new AppError(
      "Trial days must be greater than 0 when trial is enabled",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (payload.billingType !== "monthly" && payload.billingType !== "yearly") {
    throw new AppError(
      "Billing type must be monthly or yearly",
      StatusCodes.BAD_REQUEST,
    );
  }

  const isExist = await SubscriptionPlan.findOne({
    title: { $regex: `^${payload.title}$`, $options: "i" },
  });

  if (isExist) {
    throw new AppError(
      "Subscription plan with this title already exists",
      StatusCodes.CONFLICT,
    );
  }

  if (!payload.order) {
    const lastPlan = await SubscriptionPlan.findOne()
      .sort({ order: -1 })
      .select("order");

    payload.order = lastPlan ? lastPlan.order + 1 : 1;
  }

  const result = await SubscriptionPlan.create(payload);
  return result;
};

const getAllSubscriptionPlans = async () => {
  const result = await SubscriptionPlan.find();
  return result;
};

const subscriptionPlanService = {
  createNewSubscriptionPlan,
  getAllSubscriptionPlans,
};

export default subscriptionPlanService;
