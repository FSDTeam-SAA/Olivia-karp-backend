import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import Payment from "../payment/payment.model";
import SubscriptionPlan from "../subscriptionPlan/subscriptionPlan.model";
import { User } from "../user/user.model";
import { IPurchaseSubscription } from "./purchaseSubscription.interface";
import PurchaseSubscription from "./purchaseSubscription.model";

const createPurchaseSubscription = async (
  payload: IPurchaseSubscription,
  email: string,
) => {
  // 1️⃣ Check User
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      "No account found with the provided credentials.",
      StatusCodes.NOT_FOUND,
    );
  }

  // 2️⃣ Check Subscription Plan
  const subscription = await SubscriptionPlan.findById(payload.subscriptionId);
  if (!subscription) {
    throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);
  }

  // 3️⃣ Calculate Expiration Date
  const now = new Date();
  let expirationDate: Date;

  if (subscription.hasTrial) {
    // Free Trial
    expirationDate = new Date(
      now.getTime() + (subscription.trialDays || 7) * 24 * 60 * 60 * 1000,
    );
  } else {
    // Paid Subscription
    expirationDate = new Date(now); // start from today
    if (subscription.billingType === "monthly") {
      expirationDate.setMonth(expirationDate.getMonth() + 1); // 1 month
    } else if (subscription.billingType === "yearly") {
      expirationDate.setFullYear(expirationDate.getFullYear() + 1); // 1 year
    } else {
      throw new AppError(
        "Invalid subscription billing type",
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  // 4️⃣ Create Payment Record
  const paymentData = {
    userId: user._id,
    subscriptionPlan: subscription._id,
    transactionId: payload.paymentId || "txn_" + new Date().getTime(),
    status: "paid",
    amount: subscription.price,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const payment = await Payment.create(paymentData);

  // 5️⃣ Create PurchaseSubscription Record (New Document)
  const purchaseData = {
    userId: user._id,
    subscriptionId: subscription._id,
    paymentId: payment._id,
    purchaseDate: new Date(),
    expirationDate,
  };

  const newPurchase = await PurchaseSubscription.create(purchaseData);

  return newPurchase;
};

const purchaseSubscriptionService = {
  createPurchaseSubscription,
};

export default purchaseSubscriptionService;
