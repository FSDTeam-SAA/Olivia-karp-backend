import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import PurchaseSubscription from "./purchaseSubscription.model";

// ─── Default Non-Member Benefits ───────────────────────────────────────────
const NON_MEMBER_BENEFITS = {
  planTier: null,
  planTitle: "Non-Member",
  accessLevels: {
    blogAndPodcast: "free",
    mightyNetworks: "limited",
    aiChatbot: "paid",
    events: "paid",
    courses: "paid",
    careerServices: "paid",
    mentorship: "not_available",
  },
  discounts: {
    aiChatbot: 0,
    events: 0,
    courses: 0,
    careerServices: 0,
  },
};

// ─── Get User Benefits ─────────────────────────────────────────────────────
const getUserBenefits = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  // Auto-expire any past-due subscriptions
  const now = new Date();
  await PurchaseSubscription.updateMany(
    {
      userId,
      status: "active",
      expirationDate: { $lte: now },
    },
    { $set: { status: "expired" } },
  );

  // Find the current active subscription
  const activeSub = await PurchaseSubscription.findOne({
    userId,
    status: "active",
    expirationDate: { $gt: now },
  })
    .sort({ expirationDate: -1 })
    .populate("subscriptionId");

  if (!activeSub || !activeSub.subscriptionId) {
    return {
      hasActiveSubscription: false,
      ...NON_MEMBER_BENEFITS,
    };
  }

  const plan = activeSub.subscriptionId as any;

  return {
    hasActiveSubscription: true,
    planTier: plan.planTier,
    planTitle: plan.title,
    subscriptionId: activeSub._id,
    purchaseDate: activeSub.purchaseDate,
    expirationDate: activeSub.expirationDate,
    accessLevels: plan.accessLevels,
    discounts: plan.discounts,
  };
};

// ─── Get My Subscription ───────────────────────────────────────────────────
const getMySubscription = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  // Auto-expire any past-due subscriptions
  const now = new Date();
  await PurchaseSubscription.updateMany(
    {
      userId: user._id,
      status: "active",
      expirationDate: { $lte: now },
    },
    { $set: { status: "expired" } },
  );

  const subscriptions = await PurchaseSubscription.find({ userId: user._id })
    .populate("subscriptionId")
    .populate("paymentId")
    .sort({ createdAt: -1 });

  return subscriptions;
};

// ─── Get All Subscriptions (Admin) ─────────────────────────────────────────
const getAllSubscriptions = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.userId) {
    filter.userId = query.userId;
  }

  const subscriptions = await PurchaseSubscription.find(filter)
    .populate({
      path: "userId",
      select: "firstName lastName email image",
    })
    .populate({
      path: "subscriptionId",
      select: "title planTier price currency billingType",
    })
    .populate({
      path: "paymentId",
      select: "paymentId transactionId status amount",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await PurchaseSubscription.countDocuments(filter);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: subscriptions,
  };
};

const purchaseSubscriptionService = {
  getUserBenefits,
  getMySubscription,
  getAllSubscriptions,
};

export default purchaseSubscriptionService;
