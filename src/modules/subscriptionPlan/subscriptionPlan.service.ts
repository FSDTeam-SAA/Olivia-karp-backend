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

  // Validate planTier
  const validTiers = ["beginner", "monthly", "yearly"];
  if (!validTiers.includes(payload.planTier)) {
    throw new AppError(
      "Plan tier must be beginner, monthly, or yearly",
      StatusCodes.BAD_REQUEST,
    );
  }

  // Prevent duplicate planTier
  const existingTier = await SubscriptionPlan.findOne({
    planTier: payload.planTier,
    status: "active",
  });

  if (existingTier) {
    throw new AppError(
      `An active subscription plan with tier "${payload.planTier}" already exists`,
      StatusCodes.CONFLICT,
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
  const result = await SubscriptionPlan.find().sort({ order: 1 });
  return result;
};

const getSingleSubscriptionPlan = async (id: string) => {
  const result = await SubscriptionPlan.findById(id);
  if (!result) {
    throw new AppError("Subscription plan not found", StatusCodes.NOT_FOUND);
  }

  return result;
};

const updateSubscriptionPlan = async (
  id: string,
  payload: Partial<ISubscriptionPlan>,
) => {
  const subscriptionPlan = await SubscriptionPlan.findById(id);
  if (!subscriptionPlan) {
    throw new AppError("Subscription plan not found", StatusCodes.NOT_FOUND);
  }

  if (
    payload.billingType &&
    payload.billingType !== "monthly" &&
    payload.billingType !== "yearly"
  ) {
    throw new AppError(
      "Billing type must be monthly or yearly",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (payload.hasTrial && (!payload.trialDays || payload.trialDays <= 0)) {
    throw new AppError(
      "Trial days must be greater than 0 when trial is enabled",
      StatusCodes.BAD_REQUEST,
    );
  }

  // If planTier is being updated, check for duplicate active tier
  if (payload.planTier && payload.planTier !== subscriptionPlan.planTier) {
    const existingTier = await SubscriptionPlan.findOne({
      planTier: payload.planTier,
      status: "active",
      _id: { $ne: id },
    });

    if (existingTier) {
      throw new AppError(
        `An active subscription plan with tier "${payload.planTier}" already exists`,
        StatusCodes.CONFLICT,
      );
    }
  }

  const result = await SubscriptionPlan.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const subscriptionPlanService = {
  createNewSubscriptionPlan,
  getAllSubscriptionPlans,
  getSingleSubscriptionPlan,
  updateSubscriptionPlan,
};

export default subscriptionPlanService;
